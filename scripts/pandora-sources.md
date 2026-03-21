# Pandora (зарядные станции) — источники данных

Каталог **pandora-rs.ru** работает на **Tilda Store**. Карточки и галереи подтягиваются через публичный JSON API (тот же источник, что и у виджета каталога на сайте).

## Скрипты (как у TSS)

1. **Парсинг карточек и URL фото** (без браузера):

   ```bash
   npx tsx scripts/parse-pandora-products.ts
   ```

   Пишет `scripts/pandora-products-charging-stations.json` (описание, характеристики, `gallery` → `{ thumb, full }`).

2. **Опционально:** скачать копии фото в `public/images/products/charging-stations/` (файлы в git не хранятся — см. `.gitignore`):

   ```bash
   npx tsx scripts/download-pandora-images.ts
   ```

   По умолчанию **JSON не перезаписывается** — в репозитории остаются URL `https://static.tildacdn.com/...`, чтобы после `git clone` и `pnpm db:seed` карточки сразу показывали фото. Локальные пути в JSON: `npx tsx scripts/download-pandora-images.ts --rewrite-json`.

3. Сид базы подхватывает JSON автоматически (`prisma/seed.ts`). Если файла нет — используются 3 демо-позиции и предупреждение в консоли. После обновления JSON выполните **`pnpm db:seed`** (или `npx prisma db seed`), чтобы в БД попали актуальные URL картинок.

Запросы к каталогу и API идут с обычным Chrome User-Agent (простой `curl` без UA может получить 403).

## Прочее

- Уточняйте актуальные цены и комплектации у менеджера.
- Для ручного импорта в БД: `npx tsx scripts/import-products-to-db.ts` (включая `pandora-products-charging-stations.json`).
