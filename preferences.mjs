export const LANGUAGES = ['ru', 'en', 'es'];
export const THEMES = ['system', 'light', 'dark'];
export function detectLanguage(languages = []) {
  return languages.map(value => String(value).toLowerCase().split('-')[0]).find(value => LANGUAGES.includes(value)) || 'ru';
}
export function preferences(storage, prefix, languages = []) {
  let language, theme;
  try {language = storage.getItem(prefix + 'language'); theme = storage.getItem(prefix + 'theme');} catch {}
  return {language: LANGUAGES.includes(language) ? language : detectLanguage(languages), theme: THEMES.includes(theme) ? theme : 'system'};
}
export function writePreference(storage, prefix, name, value) {
  if (!({language: LANGUAGES, theme: THEMES}[name] || []).includes(value)) throw Error('Invalid preference');
  try {storage.setItem(prefix + name, value); return true;} catch {return false;}
}
