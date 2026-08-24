import { Telegraf, Markup, session } from "telegraf";
import { PrismaClient } from "@prisma/client";
import { askAI, fallbackAnswer, getIntent, getKnowledge, getServices } from "./ai.js";

const prisma = new PrismaClient();
const token = process.env.BOT_TOKEN;

if (!token || token.includes("PUT_YOUR")) {
  console.warn("BOT_TOKEN не задан в .env — бот ждет токена. Остальной стек работает.");
}

type Step = "name" | "phone" | "service" | "date" | "time" | "review_text" | "review_rating" | undefined;
type SessionData = {
  step?: Step;
  draft?: { name?: string; phone?: string; serviceId?: number; date?: string; time?: string };
  reviewText?: string;
};
type Ctx = any;

function mainMenu() {
  return Markup.keyboard([["Записаться", "Цены"], ["Часы / Адрес", "Оставить отзыв"]]).resize();
}
function cancelMenu() {
  return Markup.keyboard([["Отмена"]]).resize();
}

async function logDialog(telegramId: string, user: string, bot: string | null, intent?: string) {
  try { await prisma.dialog.create({ data: { telegramId: String(telegramId), messageUser: user, messageBot: bot, intent } }); } catch (e) { console.error("logDialog", e); }
}

function isValidPhone(s: string) { return /^\+?[0-9\-\s()]{7,20}$/.test(s.trim()); }
function isValidDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) return false;
  const d = new Date(s.trim()); return !isNaN(d.getTime());
}
function isValidTime(s: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(s.trim()); }

if (token && !token.includes("PUT_YOUR")) {
  const bot = new Telegraf<Ctx>(token);
  bot.use(session({ defaultSession: () => ({}) }));

  bot.command("cancel", async (ctx) => {
    ctx.session.step = undefined; ctx.session.draft = undefined; (ctx.session as any).reviewText = undefined;
    await ctx.reply("Отменено.", mainMenu());
  });
  bot.hears("Отмена", async (ctx) => {
    ctx.session.step = undefined; ctx.session.draft = undefined; (ctx.session as any).reviewText = undefined;
    await ctx.reply("Отменено.", mainMenu());
  });

  bot.start(async (ctx) => {
    const kb = await getKnowledge(prisma);
    await ctx.reply(`Привет! Я бот парикмахерской ✂️\n📍 ${kb.address}\n🕘 ${kb.hours}\n📞 ${kb.phone}\n\nВыберите действие или просто напишите вопрос — отвечу через ИИ.`, mainMenu());
  });

  bot.help(async (ctx) => {
    await ctx.reply("Команды: /start — меню, /cancel — отмена записи/отзыва. Кнопки: Записаться, Цены, Часы/Адрес, Оставить отзыв.", mainMenu());
  });

  bot.hears("Записаться", async (ctx) => {
    ctx.session.step = "name"; ctx.session.draft = {};
    await ctx.reply("Как к вам обращаться? Напишите имя (или Отмена):", cancelMenu());
  });

  bot.hears("Цены", async (ctx) => {
    const userText = "цены";
    const intent = "price";
    const ai = await askAI(prisma, userText, intent);
    let reply: string;
    if (ai) reply = ai;
    else { const fb = await fallbackAnswer(prisma, userText); reply = fb.answer; }
    await ctx.reply(reply, mainMenu());
    await logDialog(String(ctx.from.id), "Цены", reply, intent);
  });

  bot.hears("Часы / Адрес", async (ctx) => {
    const ai = await askAI(prisma, "часы и адрес", "hours");
    let reply: string;
    if (ai) reply = ai;
    else {
      const kb = await getKnowledge(prisma);
      reply = `📍 ${kb.address}\n🕘 ${kb.hours}\n📞 ${kb.phone}`;
    }
    await ctx.reply(reply, mainMenu());
    await logDialog(String(ctx.from.id), "Часы / Адрес", reply, "hours");
  });

  bot.hears("Оставить отзыв", async (ctx) => {
    ctx.session.step = "review_text";
    await ctx.reply("Напишите текст отзыва (или Отмена):", cancelMenu());
  });

  bot.on("text", async (ctx, next) => {
    const text: string = ctx.message.text?.trim() ?? "";
    if (!text) return next();
    const step = ctx.session.step as Step;

    // Шаги записи/отзыва имеют приоритет
    if (step === "name") {
      if (text.length < 2) return ctx.reply("Имя слишком короткое — напишите еще раз:");
      ctx.session.draft!.name = text;
      ctx.session.step = "phone";
      return ctx.reply("Спасибо! Теперь телефон (например +79001234567):", cancelMenu());
    }
    if (step === "phone") {
      if (!isValidPhone(text)) return ctx.reply("Телефон некорректный. Пример: +79001234567 или 89001234567:");
      ctx.session.draft!.phone = text;
      ctx.session.step = "service";
      const services = await getServices(prisma);
      const btns: string[][] = services.map((s) => [s.title]);
      btns.push(["Пропустить", "Отмена"]);
      return ctx.reply("Выберите услугу кнопкой или напишите (или Пропустить):", Markup.keyboard(btns).resize());
    }
    if (step === "service") {
      if (text.toLowerCase() !== "пропустить") {
        const services = await getServices(prisma);
        const found = services.find((s) => s.title.toLowerCase() === text.toLowerCase());
        if (found) ctx.session.draft!.serviceId = found.id;
        else if (text !== "Пропустить") {
          // не нашли — игнор, без услуги
        }
      }
      ctx.session.step = "date";
      return ctx.reply("На какую дату? Формат YYYY-MM-DD, например 2026-08-30:", cancelMenu());
    }
    if (step === "date") {
      if (!isValidDate(text)) return ctx.reply("Неверный формат даты. Нужно YYYY-MM-DD, например 2026-08-30:");
      const d = new Date(text); const today = new Date(); today.setHours(0, 0, 0, 0);
      if (d < today) return ctx.reply("Дата в прошлом — укажите будущую дату:");
      ctx.session.draft!.date = text;
      ctx.session.step = "time";
      return ctx.reply("Во сколько? Формат HH:MM, например 14:00:", cancelMenu());
    }
    if (step === "time") {
      if (!isValidTime(text)) return ctx.reply("Неверный формат времени. Нужно HH:MM, например 14:00:");
      ctx.session.draft!.time = text;
      const d = ctx.session.draft!;
      try {
        const appt = await prisma.appointment.create({
          data: {
            clientName: d.name!,
            clientPhone: d.phone!,
            clientTelegramId: String(ctx.from.id),
            clientTelegramUsername: (ctx.from as any).username || null,
            serviceId: d.serviceId || null,
            date: d.date!,
            time: d.time!,
            status: "new",
            source: "telegram"
          }
        });
        await logDialog(String(ctx.from.id), `Запись: ${d.name} ${d.phone} ${d.date} ${d.time}`, `Создана запись #${appt.id}`, "booking");
        ctx.session.step = undefined; ctx.session.draft = undefined;
        return ctx.reply(`Готово! Запись #${appt.id} создана.\n${d.name}, ждем вас ${d.date} в ${d.time}. Администратор подтвердит в админке.`, mainMenu());
      } catch (e) { console.error(e); return ctx.reply("Ошибка записи, попробуйте позже.", mainMenu()); }
    }
    if (step === "review_text") {
      if (text.length < 3) return ctx.reply("Отзыв слишком короткий — напишите подробнее:");
      (ctx.session as any).reviewText = text;
      ctx.session.step = "review_rating";
      return ctx.reply("Оцените от 1 до 5 (5 — отлично):", cancelMenu());
    }
    if (step === "review_rating") {
      const rating = parseInt(text, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) return ctx.reply("Введите число 1-5:");
      const reviewText = (ctx.session as any).reviewText as string;
      await prisma.review.create({ data: { clientName: (ctx.from as any).first_name || null, clientTelegramId: String(ctx.from.id), text: reviewText, rating, status: "new" } });
      await logDialog(String(ctx.from.id), `Отзыв ${rating}: ${reviewText}`, "Спасибо за отзыв!", "review");
      ctx.session.step = undefined; (ctx.session as any).reviewText = undefined;
      return ctx.reply("Спасибо за отзыв! Опубликуем после проверки.", mainMenu());
    }

    // Вне сценариев — ИИ + RAG + fallback
    const intent = getIntent(text);
    let answer = await askAI(prisma, text, intent);
    let usedIntent = intent;
    if (!answer) {
      const fb = await fallbackAnswer(prisma, text);
      answer = fb.answer; usedIntent = fb.intent;
    }
    await ctx.reply(answer, mainMenu());
    await logDialog(String(ctx.from.id), text, answer, usedIntent);
  });

  bot.catch((err) => console.error("Bot error", err));
  bot.launch().then(() => console.log("Bot started — polling")).catch(console.error);
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
} else {
  console.log("Bot not launched — set BOT_TOKEN in .env to enable.");
  // держим контейнер живым для docker compose
  setInterval(() => {}, 1 << 30);
}
