import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  addUnique,
  emptyManifest,
  readManifest,
  removeItems,
  writeManifest,
} from '../src/lib/manifest'

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nova-manifest-'))
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('emptyManifest', () => {
  it('arranca vacío y con versión 1', () => {
    const manifest = emptyManifest()
    expect(manifest.version).toBe(1)
    expect(manifest.skills).toEqual([])
    expect(manifest.agents).toEqual([])
    expect(typeof manifest.installedAt).toBe('string')
  })
})

describe('readManifest', () => {
  it('fichero inexistente → manifiesto vacío', () => {
    expect(readManifest(path.join(dir, 'nope.json')).skills).toEqual([])
  })

  it('fichero corrupto → manifiesto vacío (no lanza)', () => {
    const file = path.join(dir, 'bad.json')
    fs.writeFileSync(file, '{ roto')
    expect(readManifest(file).agents).toEqual([])
  })

  it('filtra entradas no-string', () => {
    const file = path.join(dir, 'mix.json')
    fs.writeFileSync(file, JSON.stringify({ skills: ['a', 1, null, 'b'], agents: 'x' }))
    const manifest = readManifest(file)
    expect(manifest.skills).toEqual(['a', 'b'])
    expect(manifest.agents).toEqual([])
  })
})

describe('writeManifest', () => {
  it('roundtrip y crea directorios', () => {
    const file = path.join(dir, 'sub', '.nova-skills.json')
    const manifest = { ...emptyManifest(), skills: ['a'], agents: ['plan'] }
    writeManifest(file, manifest)
    const back = readManifest(file)
    expect(back.skills).toEqual(['a'])
    expect(back.agents).toEqual(['plan'])
  })
})

describe('helpers de listas', () => {
  it('addUnique deduplica y ordena', () => {
    expect(addUnique(['b', 'a'], ['a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  it('removeItems quita y ordena', () => {
    expect(removeItems(['a', 'b', 'c'], ['b'])).toEqual(['a', 'c'])
  })
})
