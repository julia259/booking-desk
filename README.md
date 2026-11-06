# Booking Desk

<img src="src/assets/icon.svg" width="88" alt="Booking Desk">

Локальная доска записей с экспортом календаря. Локальный инструмент 0.1.0, JavaScript / Node.js.

## Запуск

Node.js 22+. Windows: Start.cmd. macOS/Linux: sh start.sh. Откройте http://127.0.0.1:8810/. Порт можно задать переменной PORT. Сервер слушает только 127.0.0.1 и отдаёт фиксированный список файлов. Не открывайте index.html напрямую: ES modules требуют HTTP.

Добавьте записи в редакторе расписания или нажмите «Пример». Для каждой записи укажите ресурс, название, начало и конец с явным UTC-смещением, например `2026-11-06T09:00+01:00`. Нажмите «Обработать» для проверки и экспорта ICS.

## Редактор расписания — 6 ноября 2026

- Добавление и редактирование записей без ручной правки CSV; отмена незавершённой правки.
- Удаление с подтверждением внутри карточки и отмена последнего добавления, изменения или удаления.
- Фильтр по дню начала записи в указанном в ней смещении. Это фильтр списка, не недельная календарная сетка. Экспорт всегда включает всё расписание.
- Подсветка пересечений одного ресурса с учётом UTC. Соседние интервалы разрешены; при пересечении экспорт ICS отклоняется.
- CSV остаётся доступен. Дополнительные столбцы сохраняются при редактировании. Неправильный CSV блокирует редактор, не заменяя исходный текст. Смена CSV извне сбрасывает текущую правку и историю отмены.
- Редактор записывает столбец `uid`: изменение названия и времени сохраняет UID календарного события. При первом редактировании старого CSV исходные UID соответствуют прежнему экспортёру. Сохраняйте столбец `uid` при последующей ручной правке; без него идентификатор снова вычисляется по старому правилу (время начала и позиция).
- RU/EN/ES для редактора. Данные пользователя не переводятся. Сохранение и открытие проекта используют прежние кнопки и IndexedDB; автосохранения нет.

Список показывает до 200 записей выбранного дня; обработка и экспорт работают со всем CSV в пределах прежнего лимита 10 000 строк. Несколько именованных проектов и вид недели в эту итерацию не входят.

Новые модули автономны: `src/js/booking-entry.mjs` запускает общую оболочку и затем редактор; `src/js/booking-model.mjs` содержит проверку времени и идентификаторов. Файлы добавлены в явный список сервера и версионный офлайн-кэш. Если PWA предлагает обновление, сначала сохраните проект, затем нажмите «Обновить приложение».

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
