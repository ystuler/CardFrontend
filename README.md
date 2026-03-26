# CardFrontend

Фронтенд на SvelteKit для работы с Card Backend API.

## Требования

- Node.js 20+ (рекомендуется 22)
- pnpm
- Для Docker-режима: Docker Desktop (или Docker Engine + docker compose)
- Запущенный backend на http://localhost:8000

## Запуск в Docker

В проекте есть два сервиса:

- frontend-dev: режим разработки, порт 5173
- frontend-prod: preview-сборка, порт 3000

Команды:

1. Сборка и запуск
	docker compose up --build

2. Открыть приложение
	Dev: http://localhost:5173
	Prod preview: http://localhost:3000

3. Остановить
	Ctrl+C в терминале

4. Удалить контейнеры/сеть
	docker compose down

## Запуск bare metal (локально без Docker)

1. Установить зависимости
	pnpm install

2. Проверка типов и Svelte-диагностики
	pnpm check

3. Запуск dev-сервера
	pnpm dev -- --open

4. Открыть приложение
	http://localhost:5173

## Локальный preview (условно production)

1. Сборка
	pnpm build

2. Запуск preview
	pnpm preview -- --host 0.0.0.0 --port 3000

3. Открыть
	http://localhost:3000

## Примечание по API

Фронтенд ходит в backend по адресу http://localhost:8000. Если backend запущен на другом хосте/порту, обнови значение API_BASE в [src/lib/api.ts](src/lib/api.ts).
