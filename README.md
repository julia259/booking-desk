# Booking Desk

<img src="src/assets/icon.svg" width="88" alt="Booking Desk">

Manage a local appointment board and export a calendar. Local JavaScript / Node.js utility, version 0.1.0.

## Quick start

Node.js 22 or newer is required. On Windows, run Start.cmd. On macOS/Linux, run sh start.sh. Open http://127.0.0.1:8810/. Override the port with the PORT environment variable. The server listens only on 127.0.0.1 and serves an explicit file allowlist. Open the HTTP address rather than index.html directly: ES modules require HTTP.

Add entries in the schedule editor or choose Example. Each entry needs a resource, title, start and end with an explicit UTC offset, such as `2026-11-06T09:00+01:00`. Choose Run to validate the schedule and export ICS.

## Schedule editor — 2026-11-06

- Add and edit entries without manually changing CSV; cancel an unfinished edit.
- Delete with an inline confirmation, and undo the latest addition, edit or deletion.
- Filter the list by an entry's start date in its stated UTC offset. This is a list filter, not a weekly calendar grid. Exports always include the complete schedule.
- Highlight overlaps for the same resource using UTC comparisons. Adjacent intervals are allowed; an overlap prevents ICS export.
- CSV remains available. Edits preserve additional columns. Invalid CSV disables the editor without replacing the source text. Changing CSV outside the editor resets the current edit and undo history.
- The editor writes a `uid` column so changing a title or time preserves the calendar event UID. The first edit of legacy CSV retains the IDs used by the previous exporter. Keep the `uid` column during later manual edits; without it, IDs are recalculated using the legacy start-time-and-position rule.
- The editor supports English, Russian and Spanish. User content is not translated. The existing Save project and Open saved project controls use IndexedDB; documents are not autosaved.

The list displays up to 200 entries for the selected day. Processing and export use the entire CSV within the existing 10,000-row limit. Multiple named projects and a weekly view are not included.

The modules are standalone: `src/js/booking-entry.mjs` starts the shared interface and then the editor; `src/js/booking-model.mjs` validates times and identifiers. Both files are included in the server allowlist and versioned offline cache. If the PWA offers an update, save your project before choosing Update application.

## Inputs

- **CSV: resource,start,end,title (times with Z or an offset such as +02:00)** (textarea).

Input, processing and files stay in the browser. Saving input on this device requires an explicit button action; selected files are not included in that legacy input save. Clear saved data removes only this application's saved input. Local storage is not encrypted: avoid shared browser profiles for sensitive data. Review exported results before using them in a production workflow.

## Scope and limitations

Public appointment booking requires a server, authentication and slot-conflict handling. There is no network publishing, shared-user synchronization or automatic paid API access. Native macOS/Linux operation has not been verified on actual devices.

## Verification

node --test tests/*.test.mjs

The shared interface and server originate from product-launchpad/scaffold. This project is standalone and does not import neighboring applications. Tool logic is in src/js/tool.mjs. Included examples use synthetic data.

## License

Original code is licensed under MIT. Author: Denis Gutsuliak (d9911).

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
