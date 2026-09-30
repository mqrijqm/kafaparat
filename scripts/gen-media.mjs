// Generates images through Codex CLI (pinned model, never Astra) and copies them into media-src/.
// Usage: node scripts/gen-media.mjs scripts/media.json [--only name1,name2] [--force]
import { spawn } from 'node:child_process'
import { readFileSync, existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'

const MODEL = 'gpt-5.6-sol'
const CONCURRENCY = 4
const OUT = resolve('media-src')
const GEN_DIR = join(homedir(), '.codex', 'generated_images')

const [, , listFile, ...flags] = process.argv
const { style, items } = JSON.parse(readFileSync(listFile, 'utf8'))
const onlyIdx = flags.indexOf('--only')
const only = onlyIdx >= 0 ? flags[onlyIdx + 1].split(',') : null
const force = flags.includes('--force')

if (MODEL.includes('astra')) throw new Error('Astra is not allowed')
mkdirSync(OUT, { recursive: true })

const queue = items.filter(
  (it) => (!only || only.includes(it.name)) && (force || !existsSync(join(OUT, `${it.name}.png`))),
)

function run(item) {
  const prompt = [
    `Use your built-in image generation tool to create exactly ONE image. Aspect ratio ${item.aspect ?? '3:2'}.`,
    `Subject: ${item.prompt}`,
    item.noStyle ? '' : `Style: ${style}`,
    'Do NOT try to save, copy or move the file anywhere and do not run any shell commands. Just generate the image once, then reply with the single word DONE.',
  ].join('\n')

  return new Promise((done) => {
    const t0 = Date.now()
    const child = spawn(
      'codex',
      ['exec', '--json', '-m', MODEL, '--skip-git-repo-check', '-s', 'read-only', '-'],
      { shell: true },
    )
    let log = ''
    child.stdout.on('data', (d) => (log += d))
    child.stderr.on('data', (d) => (log += d))
    child.stdin.end(prompt)
    child.on('close', () => {
      const id = log.match(/"thread_id"\s*:\s*"([^"]+)"/)?.[1]
      const dir = id && join(GEN_DIR, id)
      const pngs = dir && existsSync(dir)
        ? readdirSync(dir).filter((f) => f.endsWith('.png'))
            .map((f) => join(dir, f)).sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
        : []
      const secs = Math.round((Date.now() - t0) / 1000)
      if (pngs.length) {
        copyFileSync(pngs[0], join(OUT, `${item.name}.png`))
        console.log(`OK   ${item.name} (${secs}s)`)
      } else {
        console.log(`FAIL ${item.name} (${secs}s) thread=${id}\n${log.slice(-600)}`)
      }
      done()
    })
  })
}

console.log(`Generating ${queue.length} image(s) with ${MODEL}...`)
const workers = Array.from({ length: CONCURRENCY }, async () => {
  while (queue.length) await run(queue.shift())
})
await Promise.all(workers)
console.log('ALL DONE')
