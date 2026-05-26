import { cp, mkdir, rm } from 'node:fs/promises'

await rm('dist/client', { recursive: true, force: true })
await mkdir('dist', { recursive: true })
await cp('game/dist/client', 'dist/client', { recursive: true })
