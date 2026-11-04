(() => {
  const id = document.currentScript?.dataset.tool;
  if (id) {
    try {
      const key = 'local-tool:' + id + ':';
      const value = localStorage.getItem(key + 'theme');
      const dark = value === 'dark' || !['light','dark'].includes(value) && matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      const lang = localStorage.getItem(key + 'language');
      if (['ru','en','es'].includes(lang)) document.documentElement.lang = lang;
    } catch {}
  }
  if (location.protocol === 'file:') document.addEventListener('DOMContentLoaded', () => {document.getElementById('file-notice').hidden = false;});
})();
