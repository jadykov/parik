# lastprojectmemory — точка останова parikmaherskaya

Дата: 2026-08-25 17:56 UTC (MSK 20:56)
Проект: деревенская парикмахерская — сайт + админка + Telegram-бот с ИИ, Docker

## Где остановились — 7/7 Этап деплой ГОТОВ
- `sg docker` теперь работает (muse в группе docker, `docker ps` OK). Проблема с `docker compose up --build` была в Prisma OpenSSL: `libssl.so.1.1 missing` на node:20-alpine (openssl 3.x). Фикс: `app/prisma/schema.prisma:2` + `bot/prisma/schema.prisma:5` → `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`, `app/Dockerfile:2` + `bot/Dockerfile:2` → `RUN apk add --no-cache openssl`. Сначала сборка тянула host `node_modules` (огромный контекст) — добавлен `.dockerignore` в app/bot, volumes пересозданы.
- Также `app/prisma/migrations` отсутствовали (migrate deploy пустой), применен `prisma db push` (создал 7 таблиц: users/services/appointments/reviews/knowledge_base/dialogs/_prisma_migrations), затем `prisma db seed` → admin/admin123, 4 services, 3 knowledge_base. `/app/node_modules/.prisma` теперь с `libquery_engine-linux-musl-openssl-3.0.x.so.node`, `/bot` аналогично.
- Бот: `bot/Dockerfile:10` сменен CMD с `npm run dev` (tsx watch — тащил 2 процесса, провоцировал 409) на `npm start` (`tsx src/index.ts`). В `bot/src/index.ts:187-204` добавлен `launchWithRetry` с `dropPendingUpdates: true` и retry 60с при 409 Conflict. Остаточный 409 от параллельных `docker exec` тестов (getUpdates держит сессию 60с) — после `docker compose stop` и ожидания 60с бот стартует `Bot started — polling`. Внутри контейнера `await b.telegram.getMe()` OK, `api.telegram.org` доступен. Хост `curl getMe/getWebhookInfo/deleteWebhook` OK, `getUpdates?timeout=5` возвращает [] когда бот остановлен.
- Проверено: `sg docker -c "docker ps"` → barbershop_db healthy 5432, barbershop_app 3000, barbershop_bot running; `curl localhost:3000 200`, `/services /masters /reviews /contacts /login 200`, `/api/services 200` (4 услуги), `/api/knowledge 200` (3 записи), `POST /api/auth/login admin/admin123 → {id:1 role:admin}`, `docker exec psql \dt` 7 таблиц, `prisma.count` appointments 0 dialogs 0 users 1.
- Git: локально `main dbf67ca fix: deploy — prisma openssl 3.0.x ...` (7 files, + .dockerignore), push origin main OK `35401d1..dbf67ca`. Remote `github.com/jadykov/parik` HEAD dbf67ca. Ветка clean, без .env (BOT_TOKEN 8767483153:AAFZ... только в .env, getMe ok, webhook url="").

## Что осталось (опционально)
- Этап 7 полностью в docker на этом хосте: `docker compose up -d` работает, сайт `http://localhost:3000`, админка `http://localhost:3000/login` admin/admin123, бот @epersona_bot должен отвечать `/start` после 60с от последней 409. Если 409 повторяется — `docker compose restart bot` и ждать 60с.
- Для продакшена: `docker-compose.prod.yml` (next build + next start, без volumes), домен, прокси, AI_API_KEY заменить PUT_YOUR на реальный (сейчас fallback из БД работает).
- Токен в чате — напомнить revoke у @BotFather после теста.

## Команда запуска (восстановление)
```
sg docker -c "cd /home/muse/workbench/parikmaherskaya && docker compose up --build -d"
sg docker -c "docker logs barbershop_bot --tail 50; docker ps; curl http://localhost:3000/api/services"
# admin: admin / admin123
```
