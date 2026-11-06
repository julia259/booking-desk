import messages from './messages.mjs';
// Tool metadata is authored in Russian; preserve its source until the UI sets a locale.
let language = 'ru';
export function setLanguage(value) {language = ['ru', 'en', 'es'].includes(value) ? value : 'en';}
export function tr(source) {return language === 'ru' ? source : messages[source]?.[language === 'en' ? 0 : 1] ?? source;}
export function msg(strings, ...values) {
  const source = strings.reduce((text, part, i) => text + part + (i < values.length ? '{' + i + '}' : ''), '');
  return tr(source).replace(/\{(\d+)\}/g, (match, index) => index < values.length ? String(values[index]) : match);
}
