(() => {
  const id = document.currentScript?.dataset.tool;
  let language;
  if (id) {
    try {
      const key = 'local-tool:' + id + ':';
      const value = localStorage.getItem(key + 'theme');
      const dark = value === 'dark' || !['light','dark'].includes(value) && matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      language = localStorage.getItem(key + 'language');
    } catch {}
  }
  const supported = ['ru','en','es'], nav = globalThis.navigator;
  const languages = nav?.languages?.length ? nav.languages : [nav?.language];
  document.documentElement.lang = supported.includes(language) ? language :
    languages.map(value => String(value).trim().toLowerCase().split(/[-_]/)[0]).find(value => supported.includes(value)) || 'en';
  if (location.protocol === 'file:') document.addEventListener('DOMContentLoaded', () => {document.getElementById('file-notice').hidden = false;});
})();
