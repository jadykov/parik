# lastprojectmemory — точка останова parikmaherskaya

Дата: 2026-08-24 19:52 UTC
Проект: деревенская парикмахерская — сайт + админка + Telegram-бот с ИИ, Docker

## Где остановились
- 6 этапов готово (сайт 5 страниц /,/services,/masters,/reviews,/contacts + /login, админка 7 разделов /admin + 13 API routes + bot ai.ts RAG + docker-compose.yml 3 сервиса db/app/bot). `next build` ✓ 25 routes, `tsc` 0, `compose config` VALID, `prisma validate` app+bot VALID. Docker в этом sandbox не стартует (muse uid 1001 не в docker группе, sock root:docker только у claude_cli) — тестить на WSL Docker Desktop.
- Git: локально `main` 2 коммита d517e90 feat MVP + 87fa9ca tar.gz (без .env, .gitignore VALID), remote `github.com/jadykov/parik` — пользователь сам залил upload 48e8f92 (63 файла) + 11170a9 delete tar.gz, потом merge 6f0020e (pull --allow-unrelated-histories) + push origin main OK (Hi jadykov authenticated, ssh ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKgALzIrngzKSKO3SlGb/W2NXrv4AIc0Y8FURf+vKELe). HEAD 69 файлов, tar.gz вернулся.
- Секреты: `.env:14 BOT_TOKEN=8767483153:AAFZ9qucEb9ET_XcuO853OzSQnTkuT2m6ig` записан chmod 600, на GitHub не попал (только .env.example PUT_YOUR), бот @epersona_bot getMe OK, AI_API_KEY остался PUT_YOUR — bot fallback из БД.
- Архивы: /tmp/parokmaherskaya.tar.gz 89K с .env, /tmp/parokmaherskaya_github.tar.gz без .env, локально parikmaherskaya.tar.gz для push. Пользователь новичок — объяснять мышкой (uploading an existing file).
- Ключи: ~/.ssh/id_ed25519 ed25519 muse@parikmaherskaya, added to github.com/settings/keys as muse, known_hosts github.com, origin теперь git@github.com:jadykov/parik.git (был parokmaherskaya).
- Рабочие папки: в sandbox /home/muse/workbench/parikmaherskaya, на WSL ожидается /home/workbench/parikmaherskaya или git clone https://github.com/jadykov/parik.git. План в project_parikmaherskaya.md, инструкция в README.md (docker compose up --build -d + prisma migrate dev + db seed admin/admin123).
- Следующий шаг: на новом WSL `git clone git@github.com:jadykov/parik.git; cp .env.example .env (вставить BOT_TOKEN); docker compose up --build -d; docker compose exec app npx prisma migrate dev --name init; npx prisma db seed` -> http://localhost:3000 + @epersona_bot /start. Этап 7 деплой опционально (docker-compose.prod.yml). Токен в чате — напомнить revoke после теста у @BotFather.
- Контекст: пользователь просит писать кратко и по фактам, без эмодзи, путь file:line. Перед каждым этапом спрашивать продолжение — пройдено 6/7. Проект small flow, шаблоны, Postgres 16, Prisma, Next.js 14 + Telegraf + jose+zod. RBAC admin/employee.
