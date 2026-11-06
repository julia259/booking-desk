import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {preferences} from '../src/js/preferences.mjs';
const cases = [
 [{languages:['en-US']},'en'], [{languages:['es-MX']},'es'], [{languages:['ru-RU']},'ru'],
 [{languages:['de-DE','ES_ar','en']},'es'], [{languages:[' RU_ru ']},'ru'],
 [{languages:['de-DE','ja-JP']},'en'], [{languages:[]},'en'],
 [{language:'es-MX',languages:[]},'es'], [{language:'ru-RU'},'ru'],
];

test('browser languages, unsupported fallback, and saved choice agree before and after loading', async () => {
 const boot = await readFile(new URL('../src/js/boot.js', import.meta.url), 'utf8');
 for (const [navigator, expected] of cases) for (const saved of [null, 'invalid', 'ru', 'en', 'es']) for (const blocked of [false, true]) {
  const storage = {getItem(key){if(blocked)throw Error('blocked');return key.endsWith('language') ? saved : null;}};
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const wanted = !blocked && ['en','es','ru'].includes(saved) ? saved : expected;
  assert.equal(preferences(storage, 'local-tool:fixture:', languages).language, wanted);
  const document = {currentScript:{dataset:{tool:'fixture'}},documentElement:{dataset:{}}};
  runInNewContext(boot, {document,navigator,localStorage:storage,matchMedia:()=>({matches:false}),location:{protocol:'http:'}});
  assert.equal(document.documentElement.lang, wanted);
 }
});
