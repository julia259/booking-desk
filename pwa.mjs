export async function setupPWA({install, update, status, text}) {
  if (!('serviceWorker' in navigator)) return;
  let prompt;
  window.addEventListener('beforeinstallprompt', event => {event.preventDefault(); prompt = event; install.hidden = false;});
  install.onclick = async () => {if (!prompt) return; await prompt.prompt(); await prompt.userChoice; prompt = null; install.hidden = true;};
  const registration = await navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'});
  const waiting = () => {if (registration.waiting && navigator.serviceWorker.controller) update.hidden = false;};
  registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', waiting));
  waiting();
  let requested = false;
  update.onclick = () => {if (!registration.waiting) return; requested = true; registration.waiting.postMessage('activate');};
  navigator.serviceWorker.addEventListener('controllerchange', () => {if (requested) location.reload();});
  const connection = () => {status.textContent = navigator.onLine ? text('online') : text('offline');};
  window.addEventListener('online', connection); window.addEventListener('offline', connection); connection();
  // No timed reload: the user can save their draft before accepting an update.
}
