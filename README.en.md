# Booking Desk

Локальная доска записей с экспортом календаря

Local JavaScript tool, Node.js 22+. Windows: Start.cmd; macOS/Linux: sh start.sh. Open http://127.0.0.1:8810/. Direct file:// loading is unsupported. Use Example, Run, then export links. Files are processed in-browser, never uploaded. Input persistence is opt-in via Save on this device; selected files are not stored. Clear saved data removes only this app's stored input. No public hosting, shared-user auth, automatic publishing or paid APIs. Actual native Mac/Linux operation is unverified.

Tests: node --test tests/*.test.mjs. Full field formats and scope: README.md. Original code MIT, Denis Gutsuliak.

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
