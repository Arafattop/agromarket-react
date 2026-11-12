# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Тестирование

- `npm test` — компонентные тесты (Vitest + Testing Library), моки fetch
- `npm run coverage` — покрытие: ...%
- `npm run e2e` — E2E (Playwright). На продакшене: `$env:E2E_BASE_URL="https://ваш-сайт.vercel.app"; npm run e2e`. В CI — ежедневно и по кнопке

## Лабораторная 10 — ответы

- Сколько компонентных тестов и какие компоненты покрыты: ...
- Какие реальные дефекты нашли тесты (подписи полей, состояние загрузки и т.п.): ...
- Покрытие: ...%; хуже всего покрыт ... потому что ...
- Время: компонентные ... с, E2E ... с: во сколько раз медленнее: ...
- Почему E2E не запускаем на каждый PR: ...
- Сколько e2e-пользователей в базе и чем это плохо: ...
- Использовал(а) ли ИИ и для чего: ...

