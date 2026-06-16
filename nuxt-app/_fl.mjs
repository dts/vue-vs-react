import m from './.nuxt/dist/server/client.manifest.mjs'
import fs from 'node:fs'; import z from 'node:zlib'
const wanted=new Set()
for(const [k,v] of Object.entries(m)){
  const take=(e)=>{ if(e.file&&e.file.endsWith('.js'))wanted.add(e.file); (e.imports||[]).forEach(i=>{const t=m[i]; if(t)take(t)}) }
  if(v.isEntry) take(v)
  if(k.includes('pages/index')) take(v)
}
const files=[...wanted]; let raw=0; const bufs=[]
for(const f of files){const p='.output/public/_nuxt/'+f; if(!fs.existsSync(p))continue; const b=fs.readFileSync(p);raw+=b.length;bufs.push(b);console.log((b.length/1000).toFixed(1).padStart(8)+'kB  '+f)}
const gz=z.gzipSync(Buffer.concat(bufs),{level:9}).length
console.log('---\nNuxt First Load JS for /:  raw='+(raw/1000).toFixed(1)+'kB  gzip='+(gz/1000).toFixed(1)+'kB')
