import {readBookings,writeBookings,changeBooking,conflicts} from './booking-model.mjs';

const copy={
 ru:{heading:'Редактор расписания',hint:'Добавляйте записи здесь или вставьте CSV ниже. Время указывайте со смещением: 2026-11-06T09:00+01:00.',resource:'Ресурс',title:'Название записи',start:'Начало',end:'Конец',add:'Добавить запись',apply:'Сохранить изменения',cancel:'Отменить правку',edit:'Изменить',remove:'Удалить',undo:'Отменить последнее изменение',day:'День начала записи',all:'Все дни',empty:'Записей пока нет. Добавьте первую или нажмите «Пример».',conflict:'Есть пересечения. Исправьте отмеченные записи перед экспортом ICS.',ok:'Пересечений нет.',invalid:'Исправьте CSV ниже. Редактор не заменял исходные данные.',count:'Записей',preview:'Показаны первые 200 записей; фильтр по дню помогает сузить список. Полный экспорт доступен ниже.',editing:'Редактирование записи',new:'Новая запись',changed:'Источник изменился. Несохранённая правка отменена.',reload:'Отменить правку и перечитать CSV',unsaved:'Есть несохранённая правка. Сначала сохраните или отмените её.',removeConfirm:'Удалить эту запись из расписания? Последнее изменение можно отменить.'},
 en:{heading:'Schedule editor',hint:'Add bookings here or paste CSV below. Include a time offset: 2026-11-06T09:00+01:00.',resource:'Resource',title:'Booking title',start:'Start',end:'End',add:'Add booking',apply:'Save changes',cancel:'Cancel edit',edit:'Edit',remove:'Delete',undo:'Undo last change',day:'Booking start date',all:'All days',empty:'No bookings yet. Add one or select Example.',conflict:'Bookings overlap. Fix the marked entries before exporting ICS.',ok:'No overlaps.',invalid:'Fix the CSV below. The editor has not replaced your source data.',count:'Bookings',preview:'Showing the first 200 bookings; filter by date to narrow the list. Full export is available below.',editing:'Edit booking',new:'New booking',changed:'Source changed. Unsaved edits were cancelled.',reload:'Discard edit and reload CSV',unsaved:'There are unsaved edits. Save or cancel them first.',removeConfirm:'Delete this booking from the schedule? You can undo the last change.'},
 es:{heading:'Editor de reservas',hint:'Añade reservas aquí o pega CSV abajo. Incluye el desfase horario: 2026-11-06T09:00+01:00.',resource:'Recurso',title:'Título de la reserva',start:'Inicio',end:'Fin',add:'Añadir reserva',apply:'Guardar cambios',cancel:'Cancelar edición',edit:'Editar',remove:'Eliminar',undo:'Deshacer el último cambio',day:'Fecha de inicio',all:'Todos los días',empty:'No hay reservas. Añade una o selecciona Ejemplo.',conflict:'Hay reservas solapadas. Corrige las filas marcadas antes de exportar ICS.',ok:'Sin solapamientos.',invalid:'Corrige el CSV de abajo. El editor no ha sustituido los datos originales.',count:'Reservas',preview:'Se muestran las primeras 200 reservas; filtra por fecha para reducir la lista. La exportación completa está disponible abajo.',editing:'Editar reserva',new:'Nueva reserva',changed:'El origen cambió. Se cancelaron los cambios sin guardar.',reload:'Descartar cambios y releer CSV',unsaved:'Hay cambios sin guardar. Guárdalos o cancélalos primero.',removeConfirm:'¿Eliminar esta reserva? Puedes deshacer el último cambio.'}
};

const host=document.getElementById('booking-editor');
const source=document.getElementById('field-csv');
let rows=[],lastSource=null,undoSource=null,editing=null,valid=true,dirty=false;
const t=key=>copy[document.documentElement.lang]?.[key]||copy.ru[key];
function element(tag,text,className){const node=document.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;}
const heading=element('h2'),hint=element('p',null,'editor-hint'),message=element('p',null,'editor-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
const form=element('form');form.id='booking-form';
const fields={};const captions={};const formGrid=element('div',null,'booking-fields');
for(const key of ['resource','title','start','end']){const label=element('label'),caption=element('span'),input=element('input');input.type='text';input.required=true;input.id='booking-'+key;input.name=key;input.autocomplete='off';if(['start','end'].includes(key))input.placeholder='2026-11-06T09:00+01:00';label.htmlFor=input.id;label.append(caption,input);formGrid.append(label);fields[key]=input;captions[key]=caption;}
const actions=element('div',null,'actions'),submit=element('button'),cancel=element('button');submit.type='submit';cancel.type='button';actions.append(submit,cancel);form.append(formGrid,actions);
const toolbar=element('div',null,'booking-toolbar'),dayLabel=element('label'),dayCaption=element('span'),day=element('input');day.type='date';day.id='booking-day';dayLabel.htmlFor=day.id;dayLabel.append(dayCaption,day);
const all=element('button'),undo=element('button');all.type=undo.type='button';toolbar.append(dayLabel,all,undo);
const list=element('div',null,'booking-list');host.append(heading,hint,form,message,toolbar,list);
form.addEventListener('input',()=>{dirty=true;translate();});
function reset(){form.reset();editing=null;dirty=false;translate();}
function translate(){host.setAttribute('aria-label',t('heading'));heading.textContent=t('heading');hint.textContent=t('hint');for(const key in captions)captions[key].textContent=t(key);submit.textContent=t(editing?'apply':'add');cancel.textContent=t('cancel');cancel.hidden=!editing&&!dirty;undo.textContent=t('undo');undo.disabled=undoSource===null;dayCaption.textContent=t('day');all.textContent=t('all');}
function render(){
 translate();list.replaceChildren();submit.disabled=!valid;undo.disabled=undoSource===null;
 if(!valid){message.textContent=t('invalid');return;}
 const pairs=conflicts(rows),bad=new Set(pairs.flat());message.textContent=`${t('count')}: ${rows.length}. ${t(pairs.length?'conflict':'ok')}`;message.dataset.error=String(pairs.length>0);
 const visible=rows.filter(row=>!day.value||row.start.slice(0,10)===day.value).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
 if(!visible.length){list.append(element('p',day.value?`${t('count')}: 0`:t('empty')));return;}
 for(const row of visible.slice(0,200)){
  const card=element('div',null,'booking-row');if(bad.has(row.uid))card.classList.add('has-conflict');
  const text=element('div');text.append(element('strong',row.title),element('p',row.resource),element('p',row.start+' → '+row.end));
  const controls=element('div',null,'actions'),edit=element('button',t('edit')),remove=element('button',t('remove'));edit.type=remove.type='button';edit.setAttribute('aria-label',t('edit')+' '+row.title);remove.setAttribute('aria-label',t('remove')+' '+row.title);
  edit.onclick=()=>{if(dirty){message.textContent=t('unsaved');return;}editing=row.uid;for(const key in fields)fields[key].value=row[key];translate();fields.title.focus();};
  remove.onclick=()=>{
   if(dirty){message.textContent=t('unsaved');return;}
   const question=element('p',t('removeConfirm')),yes=element('button',t('remove')),no=element('button',t('cancel'));
   yes.type=no.type='button';controls.replaceChildren(question,yes,no);
   no.onclick=render;yes.onclick=()=>{try{commit(rows.filter(value=>value.uid!==row.uid));}catch(error){message.textContent=error.message;}};yes.focus();
  };
  controls.append(edit,remove);card.append(text,controls);list.append(card);
 }
 if(visible.length>200)list.append(element('p',t('preview')));
}
function sync(){
 if(lastSource===source.value){translate();return;}
 const hadEdit=dirty;undoSource=null;reset();lastSource=source.value;
 try{rows=readBookings(source.value);valid=true;}catch{valid=false;rows=[];}
 render();if(hadEdit&&valid)message.textContent=t('changed');
}
function commit(next){
 const encoded=writeBookings(next);readBookings(encoded);
 undoSource=source.value;source.value=encoded;lastSource=source.value;rows=next;valid=true;reset();
 source.dispatchEvent(new Event('input',{bubbles:true}));render();
}
form.onsubmit=event=>{event.preventDefault();if(!valid)return;try{commit(changeBooking(rows,editing,Object.fromEntries(Object.entries(fields).map(([key,input])=>[key,input.value]))));}catch(error){message.textContent=error.message;message.dataset.error='true';}};
cancel.onclick=()=>{reset();render();};
undo.onclick=()=>{if(undoSource===null)return;if(dirty){message.textContent=t('unsaved');return;}const previous=undoSource;undoSource=null;source.value=previous;lastSource=null;reset();source.dispatchEvent(new Event('input',{bubbles:true}));sync();};
day.onchange=render;all.onclick=()=>{day.value='';render();};
source.addEventListener('input',sync);source.addEventListener('change',sync);
// The shared shell reports Example / restore / language changes through this status node.
new MutationObserver(sync).observe(document.getElementById('status'),{childList:true,characterData:true,subtree:true});
new MutationObserver(()=>{translate();render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
sync();
