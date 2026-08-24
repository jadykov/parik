# Проект: Сайт деревенской парикмахерской + Админка + Telegram-бот с ИИ (Docker)

> Утвержденный план. Рабочая папка проекта: `/home/workbench/parikmaherskaya` (фактически создана `/home/muse/workbench/parikmaherskaya` из-за ограничений прав в контейнере — при работе на Windows перенести в `/home/workbench/parikmaherskaya`)
> Стек на шаблонах. Docker Desktop Windows 10 (WSL2). Поток небольшой.

## 1. Стек на шаблонах (минимум багов / токенов)

*   **Сайт + Админка:** `create-next-app` (Next.js 14 App Router) + `Tailwind` + `shadcn/ui` + `Prisma ORM`
*   **Админка:** встроена в сайт по пути `/admin` — не отдельный проект
*   **БД:** `postgres:16-alpine` — 1 контейнер, 1 инстанс. Для деревни хватило бы SQLite, но Postgres в Docker стабильнее
*   **Бот:** `Node.js 20-alpine + Telegraf` (шаблон `telegraf-bot-template`) + `Muse Spark API` — отдельный контейнер
*   **Авторизация:** `NextAuth.js` или `JWT + bcrypt` + RBAC (роли)
*   **Прокси:** не нужен на старте, `Next.js` на `:3000` напрямую
*   **Деплой:** локально `docker compose up --build`, прод `docker compose -f docker-compose.prod.yml up -d` на VPS

## 2. Docker Архитектура

### docker-compose.yml — 3 сервиса
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: barber
      POSTGRES_PASSWORD: barber
      POSTGRES_DB: barbershop
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  app:
    build: ./app
    ports:
      - "3000:3000"
    depends_on:
      - db
    env_file: .env
    volumes:
      - ./app:/app
      - /app/node_modules
      - /app/.next
  bot:
    build: ./bot
    depends_on:
      - db
      - app
    env_file: .env
    restart: unless-stopped

volumes:
  pgdata:
```

### Структура папок
```
/home/workbench/parikmaherskaya/
├── docker-compose.yml
├── .env
├── project_parikmaherskaya.md (этот файл)
├── app/                 # Next.js сайт+админка+API
│   ├── Dockerfile       # node:20-alpine
│   ├── prisma/schema.prisma
│   └── src/
└── bot/                 # Telegraf бот
    ├── Dockerfile       # node:20-alpine
    └── src/
```

*   2 Dockerfile: `app/Dockerfile` (node:20-alpine) и `bot/Dockerfile` (node:20-alpine)
*   Для Windows 10 + Docker Desktop: WSL2 backend, volumes через `named volume` (pgdata) чтобы избежать проблем NTFS, `CRLF -> LF` в `.env`

## 3. Структура БД (Prisma -> PostgreSQL)

```prisma
model User { // персонал
  id           Int      @id @default(autoincrement())
  login        String   @unique
  passwordHash String
  role         String   // admin | employee
  name         String
  createdAt    DateTime @default(now())
}

model Service { // услуги с сайта
  id          Int     @id @default(autoincrement())
  title       String
  price       Int
  durationMin Int
  description String?
}

model Appointment { // записи — пишет бот
  id                   Int      @id @default(autoincrement())
  clientName           String
  clientPhone          String
  clientTelegramId     String?
  clientTelegramUsername String?
  serviceId            Int?
  masterId             Int?
  date                 String   // YYYY-MM-DD для деревни текстом
  time                 String   // HH:MM
  status               String   @default("new") // new/confirmed/done/canceled
  comment              String?
  source               String   @default("telegram")
  createdAt            DateTime @default(now())
}

model Review { // отзывы — пишет бот
  id             Int      @id @default(autoincrement())
  clientName     String?
  clientTelegramId String?
  text           String
  rating         Int      // 1-5
  status         String   @default("new") // new/published/hidden
  createdAt      DateTime @default(now())
}

model KnowledgeBase { // для ИИ — часы, адрес, цены
  id    Int    @id @default(autoincrement())
  key   String @unique // work_hours, address, phone
  value String
}

model Dialog { // логи бота для админки
  id         Int      @id @default(autoincrement())
  telegramId String
  messageUser String
  messageBot  String?
  intent     String?  // booking/price/hours/address/review
  createdAt  DateTime @default(now())
}
```

*   Prisma генерирует SQL из схемы, руками не пишем.

## 4. Сайт (клиентская часть)

1.  Лендинг с прайсом (берется из `services`)
2.  Блок "Часы работы / Адрес" (берется из `knowledge_base`) + Яндекс.Карта
3.  Форма отзывов (дублирует функционал бота)
4.  Кнопка "Записаться через Telegram" -> `t.me/your_bot`

5 страниц: Главная, Услуги/Цены, Мастера, Отзывы, Контакты.

## 5. Админ-панель (`/admin`)

*   **Доступ:** только `admin` и `employee`. `admin` создает/удаляет сотрудников в `/admin/employees`
*   **Роли:**
    *   `admin`: полный доступ — записи, отзывы, услуги/цены, сотрудники, логи диалогов, статистика, настройки (часы/адрес)
    *   `employee`: только `Записи` (просмотр, смена статуса на `подтвержден/выполнен`) и `Отзывы` (просмотр)
*   **Разделы админки:** Дашборд (записи на сегодня) / Записи (таблица с фильтрами по дате/статусу/мастеру) / Отзывы (модерация) / Услуги (CRUD цен) / Настройки (часы/адрес) / Логи бота / Сотрудники

## 6. Telegram-бот с ИИ

**System Prompt:** `Ты админ парикмахерской [Адрес из knowledge_base] [Часы] [Прайс из services]. Отвечай только по базе, не выдумывай.`

Клиент пишет `/start` -> ИИ приветствует и предлагает кнопки: `Записаться` `Цены` `Часы/Адрес` `Оставить отзыв`

*   **Сценарий 1 — Запись:** ИИ пошагово: Имя -> Телефон -> Услуга -> Дата/Время -> Мастер (опционально). Валидирует, делает `INSERT INTO appointments`, отправляет подтверждение.
*   **Сценарий 2 — Цены/Часы/Адрес:** ИИ отвечает строго по `knowledge_base` + `services` (RAG / system prompt с подгрузкой из БД)
*   **Сценарий 3 — Отзыв:** просит текст + оценку 1-5 -> `INSERT INTO reviews (status='new')`

Весь диалог логируется в `dialogs`. Упрощение для деревни: нет бронирования слотов по минутам — только `дата+время` текстом, сотрудник подтверждает вручную. Нет оплаты, нет календаря.

## 7. План работ по этапам (спрашивать подтверждение перед каждым)

**Этап 1 — Подготовка:** Утверждение ТЗ, дизайна, сбор контента (прайс, адрес, часы, фото). Инициализация проекта, `docker-compose.yml`, `.env`, `Dockerfile`.
**Этап 2 — БД и Бекенд:** Создание Prisma схемы, миграции, API для сайта/админки/бота
**Этап 3 — Сайт:** Верстка 5 страниц + интеграция с БД
**Этап 4 — Админка:** Авторизация + RBAC + CRUD разделы
**Этап 5 — Бот + ИИ:** Разработка бота Telegraf, подключение ИИ, промпт-инжиниринг, интеграция с БД
**Этап 6 — Интеграция и Тест:** Связка Сайт-БД-Бот-Админка, тест ролей, `docker compose up --build` на Windows
**Этап 7 — Деплой:** Заливка на хостинг/VPS, домен, передача доступов

Команда запуска: `docker compose up --build` -> `docker compose exec app npx prisma migrate dev` -> проверка `localhost:3000` и `localhost:3000/admin`

## 8. Оценка токенов Muse Spark 1.2 (medium effort, на шаблонах + Docker)

| Задача | Токенов (вход+выход) |
|---|---|
| Docker + compose + env (из шаблона) | ~15k |
| БД Prisma схема | ~10k |
| Сайт (лендинг из шаблона) | ~30k |
| Админка CRUD + RBAC | ~50k |
| Бот + ИИ промпт | ~50k |
| Связка и отладка в Docker Desktop | ~25k |
| **ИТОГО MVP** | **~180k - 230k** |
| Пессимистично с правками | до 270k |

Без Docker было ~250k, с Docker на шаблонах дешевле и стабильнее за счет готовых образов.

---
*Согласовано. Перед каждым этапом — запрос на продолжение. Перед Этапом 1 — отдельный запрос.*
