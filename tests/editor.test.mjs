import test from 'node:test';
import assert from 'node:assert/strict';
import {readBookings,writeBookings,changeBooking,conflicts} from '../src/js/booking-model.mjs';
import {tool} from '../src/js/tool.mjs';

const csv='resource,start,end,title,notes\nA,2026-11-06T09:00+01:00,2026-11-06T10:00+01:00,First,Keep me';
test('editing retains calendar identity and extra columns through CSV and ICS',async()=>{
 const rows=readBookings(csv);
 const edited=changeBooking(rows,rows[0].uid,{...rows[0],title:'Edited, "quoted"',start:'2026-11-06T10:00+01:00',end:'2026-11-06T11:00+01:00'});
 const restored=readBookings(writeBookings(edited));
 assert.equal(restored[0].notes,'Keep me');assert.equal(restored[0].title,'Edited, "quoted"');assert.equal(restored[0].uid,rows[0].uid);
 const first=(await tool.run({csv:writeBookings(rows)})).downloads[0].data;
 const legacy=(await tool.run({csv})).downloads[0].data;
 assert.equal(legacy.match(/^UID:(.+)$/m)[1],first.match(/^UID:(.+)$/m)[1]);
 const second=(await tool.run({csv:writeBookings(restored)})).downloads[0].data;
 assert.equal(first.match(/^UID:(.+)$/m)[1],second.match(/^UID:(.+)$/m)[1]);
});
test('conflicts use instants, allow adjacent bookings and distinguish resources',()=>{
 const rows=readBookings(csv);const overlap={resource:' A ',start:'2026-11-06T08:30Z',end:'2026-11-06T09:30Z',title:'Overlap'};
 const next=changeBooking(rows,null,overlap);assert.equal(conflicts(next).length,1);
 assert.equal(conflicts(changeBooking(rows,null,{...overlap,resource:'B'})).length,0);
 assert.equal(conflicts(changeBooking(rows,null,{...overlap,start:'2026-11-06T09:00Z'})).length,0);
 assert.equal(rows.length,1);
});
test('invalid edits never mutate source and invalid imports remain rejected',()=>{
 const rows=readBookings(csv),before=JSON.stringify(rows);
 for(const start of ['2026-02-30T09:00Z','2026-11-06T09:00','bad'])assert.throws(()=>changeBooking(rows,rows[0].uid,{...rows[0],start}));
 assert.equal(JSON.stringify(rows),before);
 assert.throws(()=>readBookings('title\nOnly title'));
 assert.throws(()=>readBookings('resource,start,end,title,uid\nA,2026-11-06T09:00Z,2026-11-06T10:00Z,X,"bad\rUID:forged"'));
});
test('legacy CSV calendar identity remains compatible for distinct start times',async()=>{
 const other='B,2026-11-06T10:00Z,2026-11-06T11:00Z,Second,Note';
 const header=csv.split('\n')[0],row=csv.split('\n')[1];
 const ids=async source=>(await tool.run({csv:source})).downloads[0].data.match(/^UID:.*$/gm).sort();
 assert.deepEqual(await ids(header+'\n'+row+'\n'+other),await ids(header+'\n'+other+'\n'+row));
});
