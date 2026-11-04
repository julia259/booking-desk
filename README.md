# Booking Desk

<img src="icon.svg" width="88" alt="Booking Desk">

Локальная доска записей с экспортом календаря. Локальный инструмент 0.1.0, JavaScript / Node.js.

## Запуск

Node.js 22+. Windows: Start.cmd. macOS/Linux: sh start.sh. Откройте http://127.0.0.1:8810/. Порт можно задать переменной PORT. Сервер слушает только 127.0.0.1 и отдаёт фиксированный список файлов. Не открывайте index.html напрямую: ES modules требуют HTTP.

Нажмите «Пример», затем «Обработать», изучите результат и сохраните нужные файлы по ссылкам экспорта. Для файловых задач выберите разрешённые файлы вручную.

## Данные

- **CSV: resource,start,end,title (время с Z или +02:00)** (textarea).

Ввод, вычисления и файлы остаются в браузере. Сохранение полей на этом устройстве — только по кнопке; выбранные файлы не сохраняются. «Удалить сохранённое» удаляет только сохранённые поля этого приложения. Локальное хранение не зашифровано: не используйте общий профиль браузера для чувствительных данных. Результат экспорта проверяйте перед переносом в рабочую систему.

## Границы

Публичная запись требует сервера, авторизации и конфликтов слотов. Нет сетевой публикации, синхронизации между людьми или автоматических платных запросов. Mac/Linux не проверены на настоящих устройствах.

## Проверка

node --test tests/*.test.mjs

Общая оболочка и сервер скопированы из ../product-launchpad/scaffold; после копирования проект автономен и не импортирует соседние приложения. Логика: tool.mjs. Исходные примеры — синтетические.

## License

MIT — собственный код; автор Denis Gutsuliak (d9911).

## Interface and local projects — 2026-11-04

The interface, fields, application errors and generated labels support Russian,
English and Spanish. User content is not translated. First opening follows browser
language and system appearance; selected language/theme persist in localStorage.
The sidebar is 250 px wide; narrow screens use a menu and tables scroll internally.

Save project stores one snapshot in IndexedDB. Open saved project restores it
explicitly. Select the file checkbox to include chosen files; otherwise reselect
them next time. Delete saved project removes the snapshot and legacy saved input,
while retaining the current form and preferences. Documents are not autosaved.

Storage estimates and a persistent-storage request are available. The browser may
deny persistence; data belongs to this origin, port and browser profile. Clearing
site data can remove it. Keep exported files and an independent backup.

A manifest and service worker support offline operation after a complete first
load. Supported browsers can install the PWA; native OS installation is unverified.
Updates never reload the page automatically: save your project before accepting an
update. Restart an existing server normally to load server changes, then refresh.

Distinct SVG, PNG 192/512 and Windows ICO icons identify this tool. No SQLite or
cloud dependency is needed. All runtime modules are local to this project:
i18n.mjs/messages.mjs, preferences.mjs, drafts.mjs, pwa.mjs and sw.js.
