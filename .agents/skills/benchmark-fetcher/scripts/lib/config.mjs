import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const PROJECT_ROOT = path.resolve(__dirname, '../../../../..')
export const MODELS_DIR = path.join(PROJECT_ROOT, 'manifests/models')

export const BENCHMARKS = Object.freeze({
  sweBench: { min: 0, max: 100, unit: 'percentage' },
  terminalBench: { min: 0, max: 1, unit: 'ratio' },
  mmmu: { min: 0, max: 100, unit: 'percentage' },
  mmmuPro: { min: 0, max: 100, unit: 'percentage' },
  webDevArena: { min: 0, max: null, unit: 'rating' },
  sciCode: { min: 0, max: 100, unit: 'percentage' },
  liveCodeBench: { min: 0, max: 100, unit: 'percentage' },
})
