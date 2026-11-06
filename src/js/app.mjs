import {tool} from './tool.mjs';
import {copy} from './ui-copy.mjs';
import {tr, setLanguage} from './i18n.mjs';
import {preferences, writePreference} from './preferences.mjs';
import {saveDraft, readDraft, deleteDraft, storageInfo} from './drafts.mjs';
import {setupPWA} from './pwa.mjs';
const $=id=>document.getElementById(id), key='local-tool:'+tool.id+':';
let storage;try{storage=globalThis.localStorage;}catch{}
const nav=globalThis.navigator;
const pref=preferences(storage,key,nav?.languages?.length?nav.languages:[nav?.language]);
let lang=pref.language,result=null,urls=[],revision=0,busy=false;
const t=name=>copy[lang][name];setLanguage(lang);
const response=await fetch('./app.json');if(!response.ok)throw Error('Application metadata unavailable');const meta=await response.json();
const fields=[];
for(const field of tool.fields){
 const label=document.createElement('label'),caption=document.createElement('span');label.htmlFor='field-'+field.key;let input;
 if(field.type==='textarea')input=document.createElement('textarea');
 else if(field.type==='select'){input=document.createElement('select');for(const opt of field.options||[]){const option=document.createElement('option');option.value=typeof opt==='string'?opt:opt.value;input.append(option);}}
 else{input=document.createElement('input');input.type=field.type==='files'?'file':field.type||'text';input.multiple=field.type==='files';if(field.directory)input.setAttribute('webkitdirectory','');if(field.accept)input.accept=field.accept;}
 input.id='field-'+field.key;input.name=field.key;if(field.type==='number')input.step='any';if(field.required)input.required=true;
 label.append(caption,input);$('fields').append(label);fields.push({field,caption,input});
}
function setValues(values){for(const{field,input}of fields)if(!['file','files'].includes(field.type)&&Object.hasOwn(values,field.key))input.value=String(values[field.key]??'');}
function getValues(){return Object.fromEntries(fields.map(({field,input})=>[field.key,field.type==='file'?input.files[0]:field.type==='files'?[...input.files]:input.value]));}
// Preserve old explicit saves; do not migrate or delete them automatically.
try{const old=JSON.parse(localStorage.getItem(key+'input')||'{}');if(old&&typeof old==='object')setValues(old);}catch{}
function status(text,error=false){$('status').textContent=text;$('status').dataset.error=String(error);}
function clearResult(){result=null;$('export').disabled=true;for(const url of urls)URL.revokeObjectURL(url);urls=[];for(const id of['downloads','table','preview'])$(id).replaceChildren();$('text').textContent='';}
function invalidate(){revision++;clearResult();status(t('changed'));}
$('fields').oninput=invalidate;$('fields').onchange=invalidate;
function controls(value){busy=value;for(const id of['run','example','restore','save','clear'])$(id).disabled=value;$('form').setAttribute('aria-busy',String(value));}
function theme(){const dark=pref.theme==='dark'||pref.theme==='system'&&globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'dark':'light';document.body.dataset.theme=dark?'dark':'light';}
theme();globalThis.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change',theme);
function translate(){
 setLanguage(lang);document.documentElement.lang=lang;document.title=tool.title;$('title').textContent=tool.title;$('description').textContent=tr(tool.description);$('boundary').textContent=tr(meta.limit);
 for(const el of document.querySelectorAll('[data-copy]'))el.textContent=t(el.dataset.copy);
 for(const id of['run','example','save','restore','clear','export','persist','install','update'])$(id).textContent=t(id);
 $('language').value=lang;$('theme').value=pref.theme;
 for(const{field,caption,input}of fields){caption.textContent=tr(field.label);if(field.placeholder)input.placeholder=tr(field.placeholder);if(field.type==='select')[...input.options].forEach((option,i)=>{const opt=field.options[i];option.textContent=tr(typeof opt==='string'?opt:opt.label);});}
}
translate();status(t('idle'));
$('language').onchange=()=>{lang=$('language').value;pref.language=lang;invalidate();translate();if(!writePreference(storage,key,'language',lang))status(t('preferencesError'),true);refreshStorage();};
$('theme').onchange=()=>{pref.theme=$('theme').value;theme();if(!writePreference(storage,key,'theme',pref.theme))status(t('preferencesError'),true);};
$('sidebar-toggle').onclick=()=>{const open=document.body.dataset.menu!=='open';document.body.dataset.menu=open?'open':'';$('sidebar-toggle').setAttribute('aria-expanded',String(open));};
function link(name,type,data){const a=document.createElement('a');a.className='download';a.textContent=name;a.download=name.replace(/[\\/:*?"<>|]/g,'_');a.href=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'}));urls.push(a.href);$('downloads').append(a);}
function render(value){
 $('text').textContent=value.text??'';
 if(value.table){const table=document.createElement('table'),head=document.createElement('tr'),thead=document.createElement('thead');for(const column of value.table.columns){const th=document.createElement('th');th.textContent=String(column);head.append(th);}thead.append(head);table.append(thead);const tbody=document.createElement('tbody');for(const row of value.table.rows.slice(0,1000)){const tr=document.createElement('tr');for(const cell of row){const td=document.createElement('td');td.textContent=String(cell??'');tr.append(td);}tbody.append(tr);}table.append(tbody);$('table').append(table);if(value.table.rows.length>1000){const p=document.createElement('p');p.textContent=t('previewLimit');$('table').append(p);}}
 if(value.preview){const frame=document.createElement('iframe');frame.title=tool.title+' · '+t('preview');frame.setAttribute('sandbox','');frame.referrerPolicy='no-referrer';const policy='<meta http-equiv="Content-Security-Policy" content="default-src &#39;none&#39;; img-src data: blob:; style-src &#39;unsafe-inline&#39;;">';frame.src=URL.createObjectURL(new Blob([policy+value.preview],{type:'text/html'}));urls.push(frame.src);$('preview').append(frame);}
 for(const download of value.downloads||[])link(download.name,download.type,download.data);$('export').disabled=false;status(value.summary||'OK');
}
function selectedFiles(values){return tool.fields.flatMap(f=>f.type==='files'?values[f.key]:f.type==='file'&&values[f.key]?[values[f.key]]:[]);}
function checkFiles(files){if(files.length>500||files.reduce((n,f)=>n+f.size,0)>250*1024*1024)throw Error(t('limit'));}
$('form').onsubmit=async event=>{
 event.preventDefault();if(busy)return;const submitted=++revision;controls(true);clearResult();status(t('busy'));
 try{const values=getValues();checkFiles(selectedFiles(values));const value=await tool.run(values);if(submitted!==revision)return;result=value;render(value);}
 catch(error){if(submitted===revision){clearResult();status(error?.message||String(error),true);}}finally{controls(false);}
};
$('example').onclick=async()=>{
 if(busy)return;invalidate();setValues(tool.example||{});for(const{field,input}of fields)if(['file','files'].includes(field.type))input.value='';const requested=revision;
 if(tool.exampleFiles){controls(true);try{const values=await tool.exampleFiles();if(requested!==revision)return;for(const[key,files]of Object.entries(values)){const transfer=new DataTransfer();for(const file of files)transfer.items.add(file);$('field-'+key).files=transfer.files;}status(t('exampleFiles'));}catch(error){if(requested===revision)status(error?.message||String(error),true);}finally{controls(false);}}
};
$('save').onclick=async()=>{
 if(busy)return;controls(true);try{const values=getValues(),files={};checkFiles(selectedFiles(values));for(const field of tool.fields)if(['file','files'].includes(field.type)){if($('include-files').checked)files[field.key]=(field.type==='file'?values[field.key]?[values[field.key]]:[]:values[field.key]).map(file=>({blob:file,name:file.name,path:file.webkitRelativePath||'',lastModified:file.lastModified}));delete values[field.key];}await saveDraft(tool.id,values,files);status(t('saved'));await refreshStorage();}catch{status(t('storageError'),true);}finally{controls(false);}
};
$('restore').onclick=async()=>{
 if(busy)return;const requested=revision;controls(true);try{
  const draft=await readDraft(tool.id);if(requested!==revision)return;if(!draft){status(t('noDraft'));return;}
  if(draft.version!==1||!draft.values||typeof draft.values!=='object'||Object.values(draft.values).some(v=>typeof v!=='string'))throw Error('Invalid saved project');
  const transfers=new Map();for(const{field}of fields)if(['file','files'].includes(field.type)){const transfer=new DataTransfer();for(const info of draft.files?.[field.key]||[]){const file=new File([info.blob],info.name,{type:info.blob.type,lastModified:info.lastModified});if(info.path)Object.defineProperty(file,'webkitRelativePath',{value:info.path});transfer.items.add(file);}transfers.set(field.key,transfer.files);}
  checkFiles([...transfers.values()].flatMap(files=>[...files]));invalidate();setValues(draft.values);for(const[key,files]of transfers)$('field-'+key).files=files;status(t('restored'));
 }catch{status(t('draftError'),true);}finally{controls(false);}
};
$('clear').onclick=async()=>{if(busy)return;controls(true);try{await deleteDraft(tool.id);localStorage.removeItem(key+'input');status(t('cleared'));await refreshStorage();}catch{status(t('storageError'),true);}finally{controls(false);}};
$('export').onclick=()=>{if(!result)return;const value={...result};delete value.downloads;link(tool.id+'-result.json','application/json',JSON.stringify(value,null,2));};
async function refreshStorage(){try{const info=await storageInfo();$('storage-usage').textContent=info?`${((info.usage||0)/1048576).toFixed(1)} / ${((info.quota||0)/1048576).toFixed(0)} MiB · ${t(info.persistent?'persistent':'temporary')}`:t('storageUnknown');}catch{$('storage-usage').textContent=t('storageUnknown');}}
$('persist').onclick=async()=>{try{const granted=await navigator.storage?.persist?.();status(t(granted?'storageGranted':'storageDenied'));await refreshStorage();}catch{status(t('storageError'),true);}};
refreshStorage();if(globalThis.navigator?.serviceWorker)setupPWA({install:$('install'),update:$('update'),status:$('connection'),text:t}).catch(()=>{$('connection').textContent=t('storageUnknown');});
