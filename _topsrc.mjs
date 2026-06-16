import { SourceMapConsumer } from 'source-map'
import { readFileSync, globSync, existsSync } from 'node:fs'
const files = process.argv.slice(2).flatMap(p=>globSync(p))
const tally={}
for (const file of files){
  if(!existsSync(file+'.map')) continue
  const code=readFileSync(file,'utf8')
  const ls=[0]; for(let i=0;i<code.length;i++) if(code[i]==='\n') ls.push(i+1)
  const off=(l,c)=>Math.min((ls[l-1]??code.length)+c,(ls[l]??code.length),code.length)
  const map=JSON.parse(readFileSync(file+'.map','utf8'))
  const con=await new SourceMapConsumer(map); const segs=[]
  con.eachMapping(m=>segs.push({o:off(m.generatedLine,m.generatedColumn),s:m.source})); con.destroy()
  segs.sort((a,b)=>a.o-b.o)
  for(let i=0;i<segs.length;i++){const e=i+1<segs.length?segs[i+1].o:code.length; tally[segs[i].s]= (tally[segs[i].s]||0)+Math.max(0,e-segs[i].o)}
}
const rows=Object.entries(tally).filter(([s])=>!/node_modules/.test(s)).sort((a,b)=>b[1]-a[1]).slice(0,20)
for(const[s,n] of rows) console.log(String(n).padStart(8), s)
