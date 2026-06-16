// Attribute bundled bytes to top-level packages via source maps.
// Robust against minifier maps that emit out-of-range / Infinity columns.
// Usage: node analyze.mjs <label> <glob> [<glob> ...]
import { SourceMapConsumer } from 'source-map'
import { gzipSync } from 'node:zlib'
import { readFileSync, globSync, existsSync } from 'node:fs'

const label = process.argv[2]
const files = process.argv.slice(3).flatMap((p) => globSync(p))

function pkgOf(p) {
  if (!p) return 'unmapped/runtime'
  const m = p.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/)
  if (m) return m[1] === 'next' ? 'next' : m[1]
  // Next's own client runtime ships as webpack://_N_E/src/... (App Router,
  // segment cache, router reducer, hydration entry, etc.)
  if (/_N_E\/(src|dist)\//.test(p) || /\/next\/(dist|src)\//.test(p)) return 'next'
  // real first-party app code
  if (/_N_E\/\.\/(app|lib|src|pages|components)\//.test(p)) return 'app code'
  if (/webpack\/(bootstrap|runtime)/.test(p) || (p.includes('webpack') && p.includes('runtime'))) return 'webpack runtime'
  if (p.includes('/.nuxt/') || p.includes('virtual:') || p.includes('nuxt')) return 'nuxt/app glue'
  if (/\.(vue|jsx?|tsx?|mjs)$/.test(p)) return 'app code'
  return 'other: ' + p.split('/').slice(-1)[0]
}

const buckets = {}
let mappedTotal = 0
let rawTotal = 0
const gzBufs = []

for (const file of files) {
  if (!existsSync(file + '.map')) {
    // No map: bucket whole file by filename heuristic.
    const buf = readFileSync(file)
    rawTotal += buf.length
    gzBufs.push(buf)
    const name = file.includes('polyfill') ? 'polyfills (core-js)' : 'unmapped: ' + file.split('/').pop()
    buckets[name] = (buckets[name] || 0) + buf.length
    mappedTotal += buf.length
    continue
  }
  const code = readFileSync(file, 'utf8')
  const buf = Buffer.from(code)
  rawTotal += buf.length
  gzBufs.push(buf)

  // byte offset of the start of each line
  const lineStart = [0]
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') lineStart.push(i + 1)
  const totalLen = code.length
  const off = (line, col) => {
    const base = lineStart[line - 1] ?? totalLen
    const nextBase = lineStart[line] ?? totalLen
    return Math.min(base + col, nextBase, totalLen)
  }

  const map = JSON.parse(readFileSync(file + '.map', 'utf8'))
  const consumer = await new SourceMapConsumer(map)
  const segs = []
  consumer.eachMapping((m) => {
    segs.push({ o: off(m.generatedLine, m.generatedColumn), source: m.source })
  })
  consumer.destroy()
  segs.sort((a, b) => a.o - b.o)
  for (let i = 0; i < segs.length; i++) {
    const start = segs[i].o
    const end = i + 1 < segs.length ? segs[i + 1].o : totalLen
    const span = Math.max(0, end - start)
    const b = pkgOf(segs[i].source)
    buckets[b] = (buckets[b] || 0) + span
    mappedTotal += span
  }
}

const gzTotal = gzipSync(Buffer.concat(gzBufs), { level: 9 }).length
const rows = Object.entries(buckets).sort((a, b) => b[1] - a[1])
console.log(`\n## ${label}`)
console.log(`emitted JS: raw=${rawTotal}  gzip9=${gzTotal}  (files=${files.length})`)
console.log('-'.repeat(60))
for (const [name, size] of rows) {
  const share = ((size / mappedTotal) * 100).toFixed(1)
  console.log(name.padEnd(36) + String(size).padStart(10) + (share + '%').padStart(9))
}
