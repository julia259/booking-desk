import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.mjs';

test('editor assets are served explicitly and private paths remain unavailable',async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const file of ['src/js/booking-entry.mjs','src/js/booking-model.mjs','src/js/booking-editor.mjs','src/css/booking-editor.css']){
   const response=await fetch(base+'/'+file);assert.equal(response.status,200,file);
   assert.match(response.headers.get('content-type'),file.endsWith('.css')?/text\/css/:/javascript/);
   assert.ok((await response.text()).length>0);
  }
  const html=await(await fetch(base+'/')).text();assert.ok(html.includes('src="./src/js/booking-entry.mjs"'));
  const sw=await(await fetch(base+'/sw.js')).text();for(const file of ['src/js/booking-entry.mjs','src/js/booking-model.mjs','src/js/booking-editor.mjs','src/css/booking-editor.css'])assert.ok(sw.includes('/'+file));
  for(const file of ['.env','.git/config','tests/editor.test.mjs'])assert.equal((await fetch(base+'/'+file)).status,404);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
