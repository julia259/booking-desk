import {tr, msg} from './i18n.mjs';
export function assert(condition,message='Invalid input'){if(!condition)throw Error(message);}
export function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function parseCSVRows(source){
 const text=String(source??'').replace(/^\uFEFF/,'');assert(text.length<=4_000_000,tr('CSV: максимум 4 млн символов'));
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
  if(c==='"'){assert(cell===''&&!closed,tr('Некорректные кавычки CSV'));quoted=true;}
  else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;rows.push(row);row=[];assert(rows.length<=10001,tr('Максимум 10 000 строк'));}}
  else {assert(!closed,tr('Символ после закрывающей кавычки CSV'));cell+=c;}
 }
 assert(!quoted,tr('Незакрытая кавычка CSV'));if(cell!==''||row.length||closed){row.push(cell);rows.push(row);}assert(rows.length<=10001,tr('Максимум 10 000 строк'));return rows;
}
export function parseCSV(text){
 const rows=parseCSVRows(text);if(!rows.length)return [];
 const headers=rows.shift().map(x=>x.trim());assert(headers.every(Boolean),tr('Пустое имя столбца CSV'));assert(new Set(headers).size===headers.length,tr('Повтор имени столбца CSV'));
 return rows.map((row,i)=>{if(!row.some(c=>c!==''))return null;assert(row.length===headers.length,msg`CSV строка ${i+2}: число столбцов отличается`);return Object.fromEntries(headers.map((key,n)=>[key,row[n]]));}).filter(row=>row!==null);
}
export function stringifyCSV(rows,columns){
 const keys=columns??Object.keys(rows[0]??{});const quote=value=>{let text=String(value??'');if(/^[\t\r ]*[=+@-]/.test(text)&&!/^[-+]?\d+(?:\.\d+)?$/.test(text))text="'"+text;return /[",\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;};
 return [keys,...rows.map(row=>keys.map(key=>row[key]))].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
}
