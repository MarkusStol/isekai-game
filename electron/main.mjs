import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = 17865;

function contentType(fp){
  const ext=path.extname(fp).toLowerCase();
  return ({
    '.html':'text/html; charset=utf-8',
    '.js':'text/javascript; charset=utf-8',
    '.mjs':'text/javascript; charset=utf-8',
    '.css':'text/css; charset=utf-8',
    '.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg',
    '.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2','.mp3':'audio/mpeg'
  })[ext] || 'application/octet-stream';
}

const server = http.createServer((req,res)=>{
  try{
    let u=decodeURIComponent((req.url||'/').split('?')[0]);
    if(u==='/') u='/index.html';
    const fp=path.normalize(path.join(ROOT, u.replace(/^\//,'')));
    if(!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()){
      res.writeHead(404); res.end('Not found'); return;
    }
    res.writeHead(200, {'Content-Type': contentType(fp), 'Cache-Control':'no-store'});
    fs.createReadStream(fp).pipe(res);
  }catch(e){ res.writeHead(500); res.end(String(e)); }
});

function createWindow(){
  const win=new BrowserWindow({
    width:1280, height:720, minWidth:1024, minHeight:576,
    backgroundColor:'#05040a',
    webPreferences:{ contextIsolation:true, nodeIntegration:false, sandbox:true },
    title:'Nocturna',
    show:false,
  });
  win.once('ready-to-show', ()=>win.show());
  win.loadURL(`http://127.0.0.1:${PORT}/index.html?desktop=1&ver=67`);
  win.webContents.setWindowOpenHandler(({url})=>{ shell.openExternal(url); return {action:'deny'}; });
}

app.whenReady().then(()=>{
  server.listen(PORT,'127.0.0.1',()=>{
    createWindow();
  });
  app.on('activate', ()=>{ if(BrowserWindow.getAllWindows().length===0) createWindow(); });
});
app.on('window-all-closed', ()=>{ server.close(); if(process.platform!=='darwin') app.quit(); });
