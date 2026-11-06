import {parseCSV,parseCSVRows,assert} from './lib.mjs';
import {tr} from './i18n.mjs';

export function instant(value){
 assert(/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value),tr('Время: YYYY-MM-DDTHH:mm+02:00 или Z; часовой пояс обязателен'));
 const day=value.slice(0,10),date=new Date(day+'T00:00:00Z');
 assert(Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===day,tr('Несуществующий день'));
 const time=Date.parse(value);assert(Number.isFinite(time),tr('Некорректная дата'));return time;
}
export function validateBooking(row){
 assert(row.resource?.trim()&&row.title?.trim(),tr('Добавьте записи'));
 assert(instant(row.end)>instant(row.start),tr('Конец должен быть позже начала'));
 return {...row,resource:row.resource.trim(),title:row.title.trim()};
}
export function validUid(uid){return typeof uid==='string'&&/^[a-zA-Z0-9._@-]{1,200}$/.test(uid);}
export function readBookings(source){
 if(!source.trim())return [];
 const header=parseCSVRows(source)[0]?.map(s=>s.trim());
 assert(['resource','start','end','title'].every(key=>header?.includes(key)),'CSV: resource, start, end, title');
 const seen=new Set();
 const rows=parseCSV(source).map(validateBooking);
 const sorted=[...rows].sort((a,b)=>instant(a.start)-instant(b.start));
 const positions=new Map(sorted.map((row,index)=>[row,index]));
 return rows.map(row=>{
  const value={...row};value.uid=row.uid||calendarUid(row,positions.get(row));
  assert(validUid(value.uid)&&!seen.has(value.uid),'CSV: uid');seen.add(value.uid);return value;
 });
}
// This is the editable source, not a spreadsheet download: preserve text verbatim.
export function writeBookings(rows){
 const columns=[...new Set(['resource','start','end','title','uid',...rows.flatMap(row=>Object.keys(row))])];
 const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
 return [columns,...rows.map(row=>columns.map(key=>row[key]))].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
}
export function changeBooking(rows,uid,values){
 assert(rows.length<10000||uid,tr('Максимум 10 000 строк'));
 const index=uid?rows.findIndex(row=>row.uid===uid):-1;
 assert(!uid||index>=0,'Booking not found');
 const value=validateBooking({...rows[index],...values,uid:uid||crypto.randomUUID()});
 return uid?rows.map((row,i)=>i===index?value:row):[...rows,value];
}
export function conflicts(rows,limit=100){
 const byResource=new Map(),found=[];
 for(const row of rows){const key=row.resource.trim();if(!byResource.has(key))byResource.set(key,[]);byResource.get(key).push({...row,startMs:instant(row.start),endMs:instant(row.end)});}
 for(const entries of byResource.values()){
  const sorted=entries.sort((a,b)=>a.startMs-b.startMs);
  for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length&&sorted[j].startMs<sorted[i].endMs;j++){
   found.push([sorted[i].uid,sorted[j].uid]);if(found.length>=limit)return found;
  }
 }
 return found;
}

export function calendarUid(row,index){
 if(row.uid){assert(validUid(row.uid),'CSV: uid');return row.uid;}
 // Keep IDs from earlier exports when importing an existing legacy schedule.
 return `booking-${instant(row.start)}-${index}@local.tools`;
}
