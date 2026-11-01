import {tool} from './tool.mjs';
const $=id=>document.getElementById(id);const key='local-tool:'+tool.id+':';let result=null,urls=[],revision=0,busy=false;
const copy={ru:{input:'Исходные данные',output:'Результат',run:'Обработать',example:'Пример',save:'Сохранить на этом устройстве',clear:'Удалить сохранённое',export:'Экспорт JSON',idle:'Укажите данные и нажмите «Обработать».',busy:'Обработка…',saved:'Данные сохранены на этом устройстве. Файлы нужно выбрать заново.',cleared:'Сохранённые данные удалены; форма и результат сохранены.',privacy:'Файлы обрабатываются в браузере. Данные не отправляются на сервер.',storage:'Сохранение — только по кнопке. Выбранные файлы не сохраняются.'},en:{input:'Input',output:'Result',run:'Run',example:'Example',save:'Save on this device',clear:'Forget saved data',export:'Export JSON',idle:'Enter input and run the tool.',busy:'Processing…',saved:'Saved on this device. Select files again next time.',cleared:'Saved data removed; current input and result retained.',privacy:'Files are processed in your browser. Data is not uploaded.',storage:'Only saved when requested. Selected files are never stored.'}};
let lang='ru';try{lang=localStorage.getItem(key+'language')||'ru';document.body.dataset.theme=localStorage.getItem(key+'theme')||'light';}catch{}if(!copy[lang])lang='ru';const t=()=>copy[lang];
$('title').textContent=tool.title;document.title=tool.title+' · Local';$('description').textContent=tool.description;
const meta=await(await fetch('./app.json')).json();$('boundary').textContent=meta.limit;
for(const field of tool.fields){const label=document.createElement('label');label.htmlFor='field-'+field.key;label.textContent=field.label;let input;if(field.type==='textarea')input=document.createElement('textarea');else if(field.type==='select'){input=document.createElement('select');for(const opt of field.options??[]){const o=document.createElement('option');o.value=typeof opt==='string'?opt:opt.value;o.textContent=typeof opt==='string'?opt:opt.label;input.append(o);}}else{input=document.createElement('input');input.type=field.type==='files'?'file':field.type||'text';input.multiple=field.type==='files';if(field.directory)input.setAttribute('webkitdirectory','');if(field.accept)input.accept=field.accept;}input.id='field-'+field.key;input.name=field.key;if(field.type==='number'){input.step='any';}if(field.placeholder)input.placeholder=field.placeholder;if(field.required)input.required=true;label.append(input);$('fields').append(label);}
function setValues(values){for(const field of tool.fields)if(!['file','files'].includes(field.type)&&Object.hasOwn(values,field.key))$('field-'+field.key).value=String(values[field.key]??'');}
function getValues(){return Object.fromEntries(tool.fields.map(f=>[f.key,f.type==='file'?$('field-'+f.key).files[0]:f.type==='files'?Array.from($('field-'+f.key).files):$('field-'+f.key).value]));}
try{setValues(JSON.parse(localStorage.getItem(key+'input')||'{}'));}catch{}
function status(text,error=false){$('status').textContent=text;$('status').dataset.error=String(error);}
function clearResult(){result=null;$('export').disabled=true;for(const url of urls)URL.revokeObjectURL(url);urls=[];for(const id of ['downloads','table','preview'])$(id).replaceChildren();$('text').textContent='';}
function invalidate(){revision++;clearResult();status(lang==='ru'?'Данные изменены. Нажмите «Обработать» для нового результата.':'Input changed. Run the tool to update the result.');}
$('fields').oninput=invalidate;$('fields').onchange=invalidate;
function translate(){for(const id of ['input-title','output-title','run','example','save','clear','export'])$(id).textContent=t()[{'input-title':'input','output-title':'output'}[id]||id];$('privacy').textContent=t().privacy;$('storage-note').textContent=t().storage;document.documentElement.lang=lang;$('language').value=lang;$('theme').value=document.body.dataset.theme;if(!result)status(t().idle);}
translate();$('language').onchange=()=>{lang=$('language').value;try{localStorage.setItem(key+'language',lang);}catch{}translate();};$('theme').onchange=()=>{document.body.dataset.theme=$('theme').value;try{localStorage.setItem(key+'theme',$('theme').value);}catch{}};
function link(name,type,data){const a=document.createElement('a');a.className='download';a.textContent=name;a.download=name.replace(/[\\/:*?"<>|]/g,'_');a.href=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'}));urls.push(a.href);$('downloads').append(a);}
function render(value){for(const url of urls)URL.revokeObjectURL(url);urls=[];for(const id of ['downloads','table','preview'])$(id).replaceChildren();$('text').textContent=value.text??'';if(value.table){const table=document.createElement('table'),thead=document.createElement('thead'),head=document.createElement('tr');for(const column of value.table.columns){const th=document.createElement('th');th.textContent=String(column);head.append(th);}thead.append(head);table.append(thead);const tbody=document.createElement('tbody');for(const row of value.table.rows.slice(0,1000)){const tr=document.createElement('tr');for(const cell of row){const td=document.createElement('td');td.textContent=String(cell??'');tr.append(td);}tbody.append(tr);}table.append(tbody);$('table').append(table);if(value.table.rows.length>1000){const p=document.createElement('p');p.textContent=lang==='ru'?'Показаны первые 1000 строк. Полный результат доступен в экспорте.':'First 1000 rows shown. Export contains the full result.';$('table').append(p);}}
 if(value.preview){const frame=document.createElement('iframe');frame.title=tool.title+' preview';frame.setAttribute('sandbox','');frame.referrerPolicy='no-referrer';const policy='<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src data: blob:; style-src &#39;unsafe-inline&#39;;">';const html=policy+value.preview;const blobURL=URL.createObjectURL(new Blob([html],{type:'text/html'}));urls.push(blobURL);frame.src=blobURL;$('preview').append(frame);}
 for(const download of value.downloads??[])link(download.name,download.type,download.data);$('export').disabled=false;status(value.summary||'OK');}
$('form').onsubmit=async event=>{
 event.preventDefault();if(busy)return;
 busy=true;const submitted=++revision;clearResult();$('run').disabled=true;$('example').disabled=true;$('form').setAttribute('aria-busy','true');status(t().busy);
 try{
  const values=getValues();const files=tool.fields.flatMap(f=>f.type==='files'?values[f.key]:f.type==='file'&&values[f.key]?[values[f.key]]:[]);
  if(files.length>500||files.reduce((n,f)=>n+f.size,0)>250*1024*1024)throw Error('Максимум 500 файлов и 250 МиБ за один запуск / Maximum 500 files, 250 MiB per run');
  const value=await tool.run(values);
  if(submitted!==revision)return;result=value;render(result);
 }catch(error){if(submitted===revision){clearResult();status(error?.message||String(error),true);}}
 finally{busy=false;$('run').disabled=false;$('example').disabled=false;$('form').setAttribute('aria-busy','false');}
};
$('example').onclick=async()=>{
 if(busy)return;invalidate();setValues(tool.example??{});const requested=revision;
 if(tool.exampleFiles){try{
  const values=await tool.exampleFiles();if(requested!==revision)return;
  for(const[key,files]of Object.entries(values)){const transfer=new DataTransfer();for(const file of files)transfer.items.add(file);$('field-'+key).files=transfer.files;}
  status(lang==='ru'?'Выбраны синтетические учебные файлы, созданные в браузере.':'Synthetic example files created in this browser.');
 }catch(error){if(requested===revision)status(error?.message||String(error),true);}}
};
$('save').onclick=()=>{try{const values=getValues();for(const f of tool.fields)if(['file','files'].includes(f.type))delete values[f.key];localStorage.setItem(key+'input',JSON.stringify(values));status(t().saved);}catch{status('Не удалось сохранить данные / Storage unavailable',true);}};
$('clear').onclick=()=>{try{localStorage.removeItem(key+'input');status(t().cleared);}catch{status('Storage unavailable',true);}};
$('export').onclick=()=>{if(!result)return;const value={...result};delete value.downloads;link(tool.id+'-result.json','application/json',JSON.stringify(value,null,2));};
