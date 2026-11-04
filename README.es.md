# Booking Desk

<img src="icon.svg" width="88" alt="Booking Desk">

Reservas por recurso, detección de solapamientos y exportación ICS. Introduce un desfase UTC explícito.

Node.js 22+. Windows: Start.cmd. macOS/Linux: sh start.sh.


## Interfaz y proyectos locales — 04.11.2026

Interfaz, campos, errores propios y etiquetas disponibles en ruso, inglés y español.
El contenido del usuario no se traduce. Al abrir por primera vez se usan el idioma
del navegador y la apariencia del sistema. Idioma y tema elegidos se conservan en
localStorage. Barra lateral de 250 px; menú en pantallas estrechas y tablas con
desplazamiento dentro del resultado.

Guardar proyecto conserva una instantánea en IndexedDB. Abrir proyecto guardado la
restaura de forma explícita. Marca la casilla para incluir archivos seleccionados;
si no, selecciónalos otra vez. Eliminar proyecto guardado borra la instantánea y
los datos antiguos, conservando el formulario actual y las preferencias. No hay
guardado automático de documentos.

Se muestra una estimación del espacio y se puede solicitar almacenamiento
persistente. El navegador puede denegarlo. Los datos pertenecen a esta dirección,
puerto y perfil del navegador; borrar datos del sitio puede eliminarlos. Conserva
los archivos exportados y una copia de seguridad independiente.

El manifiesto y service worker permiten uso sin conexión después de una primera
carga completa. Navegadores compatibles pueden instalar la PWA; no se ha verificado
la instalación en el sistema operativo. No hay recarga automática por actualizaciones:
guarda el proyecto antes de aceptarlas. Reinicia normalmente un servidor existente
para cargar cambios de servidor y después actualiza la página.

Iconos propios SVG, PNG 192/512 e ICO para Windows. No se necesitan SQLite ni nube.
Los módulos i18n.mjs/messages.mjs, preferences.mjs, drafts.mjs, pwa.mjs y sw.js se
incluyen en esta carpeta; el proyecto funciona de forma independiente.
