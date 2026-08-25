# Парикмахерская — Docker (готово к Windows 10 Docker Desktop)

## Что собрано (Этап 6: integration OK)
- **Сайт**: 5 страниц (/, /services, /masters, /reviews, /contacts) + /login — Next.js 14, Tailwind, `GET` из `services`/`knowledge`/`reviews` (Prisma)
- **Админка** `/admin` (JWT `barber_token`, RBAC): Дашборд / Записи (фильтры + смена статуса) / Отзывы (модерация) / Услуги (CRUD цен) / Настройки (address/phone/work_hours) / Логи бота / Сотрудники (создание/удаление) — только `admin`
- **API**: 13 routes, `export const dynamic = "force-dynamic"`, валидация `zod`, защита `middleware.ts` (public: `GET /api/services|knowledge|reviews`, `POST /api/appointments|reviews`)
- **БД**: Postgres 16, 6 таблиц (users/services/appointments/reviews/knowledge_base/dialogs), `prisma/seed.ts` (admin/admin123 + 4 услуги + knowledge)
- **Бот** `bot/src/index.ts` + `ai.ts`: Telegraf + session, сценарии Записаться (валидация телефона/даты/времени) + Цены/Часы/Адрес (RAG из БД) + Отзыв, ИИ `Muse Spark` через `AI_API_KEY`/`AI_BASE_URL`, fallback из БД, логи в `dialogs` → `/admin/dialogs`

Верификация в контейнере (без Docker daemon):
- `docker compose config` — VALID
- `prisma validate` app+bot — VALID
- `npx tsc --noEmit` app+bot — 0 ошибок
- `npx next build --no-lint` — ✓ Compiled successfully, 25 routes (ƒ dynamic где нужно)
- Исправлен баг `next.config.mjs` (TS syntax → JS) + добавлено `dynamic = force-dynamic` во все API routes

## Запуск на Windows 10 Docker Desktop (WSL2)

### Почему в этом окружении `docker ps` = permission denied
Пользователь `muse` не в группе `docker` — это нормально для CI-контейнера. На твоем Windows с Docker Desktop всё запустится (там юзер в docker группе по умолчанию).

### Инструкция
```powershell
# 1. Скопируй проект из контейнера на Windows
# (в текущем окружении путь /home/muse/workbench/parikmaherskaya — скопируй в C:\workbench\parikmaherskaya или в WSL: /home/workbench/parikmaherskaya)

# 2. На Windows (PowerShell или WSL2 Ubuntu)
cd C:\workbench\parikmaherskaya
copy .env.example .env
# отредактируй .env — укажи BOT_TOKEN (из @BotFather) и AI_API_KEY (Muse Spark/OpenAI)

# 3. Запуск (1 команда поднимает все)
docker compose up --build
# db → healthcheck pg_isready → app (http://localhost:3000) + bot (polling)

# 4. В другом терминале — миграции и seed (один раз)
docker compose exec app npx prisma migrate dev --name init
docker compose exec app npx prisma db seed
# или без migrate: docker compose exec app npx prisma db push --accept-data-loss && npx prisma db seed

# 5. Проверка
# Сайт: http://localhost:3000
# Админ: http://localhost:3000/login → admin / admin123
# API public: http://localhost:3000/api/services , /api/knowledge , /api/knowledge
# Бот: напиши /start в Telegram

# 6. Логи
docker compose logs -f app
docker compose logs -f bot
docker compose logs -f db
```

### Переменные .env (важные)
- `POSTGRES_USER/PASSWORD/DB` — barber/barber/barbershop
- `DATABASE_URL` — в compose уже переопределен на `postgres://barber:barber@db:5432/barbershop` (для локалки без Docker: `postgres://barber:barber@localhost:5432/barbershop`)
- `NEXTAUTH_SECRET` — смени на рандом 32+ символа в проде
- `BOT_TOKEN` — обязательно, иначе бот ждет токена (контейнер не падает)
- `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` — опционально, без них бот отвечает fallback из БД (не галлюцинирует)
- `BARBERSHOP_ADDRESS/PHONE/HOURS` — fallback если knowledge_base пустая

### RBAC (проверено в middleware.ts)
- `admin`: полный доступ — все разделы админки, CRUD услуг/пользователей/knowledge, `DELETE` appointments/reviews
- `employee`: только `GET` и модерация записей (смена статуса) + просмотр отзывов/записей. Нет доступа к /admin/services, /admin/settings, /admin/dialogs, /admin/employees. `POST /api/users` и `PUT /api/knowledge` — 403.

### Известные нюансы
- Volumes: `pgdata` — named volume (не bind) чтобы избежать проблем NTFS прав на Windows + WSL2
- `app` volume `./app:/app` + `/app/node_modules` + `/app/.next` — hot-reload в dev
- Если `next build` падает на `Can't reach database at db:5432` — нужно было `force-dynamic` (уже исправлено во всех 13 routes)
- Сид admin: `prisma/seed.ts` — `bcrypt.hash("admin123",10)`, логин `admin`

## Проверка без Docker (если Docker Desktop не стартует)
```bash
cd app && npm install && DATABASE_URL=postgres://barber:barber@localhost:5432/barbershop npx prisma db push && npx prisma db seed && npm run dev
cd bot && npm install && BOT_TOKEN=xxx DATABASE_URL=... npm run dev
```

## Структура
```
/parikmaherskaya
  docker-compose.yml (3 сервиса: db/app/bot, healthcheck)
  .env / .env.example
  app/ (Next.js + Prisma + API 13 routes + 5 pages + /admin 7 разделов + middleware)
  bot/ (Telegraf + ai.ts RAG + index.ts)
  project_parikmaherskaya.md — план
```

## Деплой на VPS Ubuntu 24.04 — для новичка (шаг за шагом)

### 1. Зайти на VPS
```bash
ssh root@ТВОЙ_IP
# или ssh user@ТВОЙ_IP
```

### 2. Обновить и поставить Docker + Git
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git nano curl
sudo systemctl enable --now docker
docker --version
docker compose version
```
Если не `root` — добавь себя в группу docker и перелогинься:
```bash
sudo usermod -aG docker $USER
# выйти из ssh и зайти заново
docker ps
```

### 3. Скачать проект
```bash
cd ~
git clone https://github.com/jadykov/parik.git
cd parik
ls -la
```

### 4. Настроить .env
```bash
cp .env.example .env
nano .env
```
Замени `BOT_TOKEN=PUT_YOUR` → токен от @BotFather. При желании смени `NEXTAUTH_SECRET`. Сохранить: `Ctrl+O` → `Enter` → `Ctrl+X`. Проверка: `cat .env`.

### 5. Запустить (billing 2-4 мин на первую сборку)
```bash
docker compose up --build -d
docker ps
# 3 контейнера: barbershop_db (healthy), barbershop_app, barbershop_bot
docker logs barbershop_db --tail 20
docker logs barbershop_app --tail 30
docker logs barbershop_bot --tail 30
# у бота должно быть: Bot started — polling (если 409 Conflict — подожди 60с, ретрай в bot/src/index.ts:187)
```

### 6. База (первый раз)
```bash
docker compose exec app npx prisma db seed
# Seed done: admin/admin123, 4 services, knowledge_base
# если пусто:
docker compose exec app npx prisma db push --accept-data-loss
docker compose exec app npx prisma db seed
```

### 7. Открыть порты (если ufw)
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

### 8. Проверка
```bash
curl -I http://localhost:3000
curl http://localhost:3000/api/services
```
Браузер: `http://ТВОЙ_IP:3000`, админка `http://ТВОЙ_IP:3000/login` → `admin` / `admin123`, бот `@epersona_bot` → `/start`.

### Полезные команды
```bash
docker compose ps
docker compose logs -f
docker compose logs -f bot
docker compose restart bot
docker compose down
docker compose up -d
git pull origin main
docker compose up --build -d
```

## Далее — Этап 7 Деплой (по желанию)
- `docker-compose.prod.yml` (без volumes на исходники, `next start` вместо `next dev`)
- VPS (Timeweb/Reg.ru) + домен + `BOT_TOKEN` прод
