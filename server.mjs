import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const meta=JSON.parse(await readFile(path.join(root,'app.json'),'utf8'));
const files=new Map(Object.entries({'/':'index.html','/index.html':'index.html','/app.mjs':'app.mjs','/tool.mjs':'tool.mjs','/lib.mjs':'lib.mjs','/style.css':'style.css','/boot.js':'boot.js','/app.json':'app.json','/icon.svg':'icon.svg'}));
for(const file of meta.vendor??[])files.set('/vendor/'+file,'vendor/'+file);
export function createServer(){return http.createServer(async(req,res)=>{
 const port=req.socket.localPort;res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host)){res.writeHead(403);return res.end();}
 if(req.method!=='GET'){res.writeHead(405);return res.end();}
 let route;try{route=new URL(req.url,'http://localhost').pathname;}catch{res.writeHead(400);return res.end();}
 if(route==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({id:meta.id,version:'0.1.0'}));}
 const file=files.get(route);if(!file){res.writeHead(404);return res.end();}
 try{const data=await readFile(path.join(root,file));const ext=path.extname(file);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'})[ext]??'application/octet-stream','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; frame-src blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});res.end(data);}catch{res.writeHead(500);res.end('Local asset unavailable');}
 });}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT??meta.port);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid port');
 const server=createServer();server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'Port already in use; existing process preserved.':e.message);process.exitCode=1;});server.listen(port,'127.0.0.1',()=>console.log(`${meta.title}: http://127.0.0.1:${port}`));
 for(const signal of ['SIGTERM','SIGINT'])process.once(signal,()=>{server.close();server.closeIdleConnections();});
}
