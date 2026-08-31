import { spawn } from 'node:child_process'

import { syncBenchmarks } from '../../fetch/lib/benchmark-sync'
import { syncGithubStars } from '../../fetch/lib/github-stars-sync'
import { syncModelSourceDigests } from '../../fetch/lib/model-source-sync'
import { syncProductVersions } from '../../fetch/lib/product-version-sync'
import { runManifestDataHarness } from '../../validate/lib/manifest-data-harness'

export const SOURCE_NAMES = [
  'product-versions',
  'benchmarks',
  'model-sources',
  'github-stars',
] as const

export type SourceName = (typeof SOURCE_NAMES)[number]
export type MaintenanceMode = 'validate' | 'check' | 'update'
export type StepStatus = 'passed' | 'current' | 'drift' | 'updated' | 'failed'

export interface MaintenanceStep {
  name: string
  kind: 'validation' | 'source' | 'derived'
  status: StepStatus
  summary: string
  details?: string[]
}

export interface MaintenanceReport {
  mode: MaintenanceMode
  sources: SourceName[]
  steps: MaintenanceStep[]
  changes: number
  passed: boolean
}

export interface SourceTaskResult {
  checked: number
  changes: number
  wrote: boolean
  details: string[]
}

export interface SourceTask {
  name: SourceName
  run(options: { rootDir: string; write: boolean; observedAt: string }): Promise<SourceTaskResult>
}

export interface MaintenanceEvent {
  phase: 'start' | 'finish'
  name: string
  step?: MaintenanceStep
}

export interface MaintenanceDependencies {
  runCommand(rootDir: string, script: string): Promise<void>
  sourceTasks: readonly SourceTask[]
  validateSchemas(rootDir: string): {
    documentsChecked: number
    schemasChecked: number
    failures: string[]
  }
}

export class ManifestDataMaintenanceError extends Error {
  readonly report: MaintenanceReport

  constructor(message: string, report: MaintenanceReport) {
    super(message)
    this.name = 'ManifestDataMaintenanceError'
    this.report = report
  }
}

function currentShanghaiDate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function runPnpmScript(rootDir: string, script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const executable = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
    const child = spawn(executable, [script], {
      cwd: rootDir,
      env: process.env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', chunk => {
      stdout += String(chunk)
    })
    child.stderr?.on('data', chunk => {
      stderr += String(chunk)
    })
    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolve()
        return
      }
      const output = [stdout.trim(), stderr.trim()].filter(Boolean).join('\n')
      reject(new Error(`${script} exited with code ${String(code)}${output ? `\n${output}` : ''}`))
    })
  })
}

const defaultSourceTasks: readonly SourceTask[] = [
  {
    name: 'github-stars',
    async run({ rootDir, write, observedAt }) {
      const result = await syncGithubStars({ rootDir, write, observedAt })
      return {
        checked: result.checked,
        changes: result.changes.length,
        wrote:
          write && (result.changes.length > 0 || result.previousObservedAt !== result.observedAt),
        details: result.changes.map(
          change => `${change.repositoryId}: ${String(change.previousStars)} -> ${change.nextStars}`
        ),
      }
    },
  },
  {
    name: 'product-versions',
    async run({ rootDir, write }) {
      const result = await syncProductVersions({ rootDir, write })
      return {
        checked: result.checked,
        changes: result.changes.length,
        wrote: write && result.changes.length > 0,
        details: result.changes.map(
          change =>
            `${change.category}/${change.id}: ${change.previousVersion} -> ${change.nextVersion}`
        ),
      }
    },
  },
  {
    name: 'benchmarks',
    async run({ rootDir, write }) {
      const result = await syncBenchmarks({ rootDir, write })
      return {
        checked: result.checked,
        changes: result.changes.length,
        wrote: write && result.changes.length > 0,
        details: result.changes.map(
          change =>
            `models/${change.modelId} ${change.benchmark}: ${String(change.previousScore)} -> ${change.nextScore}`
        ),
      }
    },
  },
  {
    name: 'model-sources',
    async run({ rootDir, write, observedAt }) {
      const result = await syncModelSourceDigests({ rootDir, write, observedAt })
      return {
        checked: result.checked,
        changes: result.changes.length,
        wrote: write && result.changes.length > 0,
        details: result.changes.map(
          change => `models/${change.modelId}: ${change.fields.join(', ')} (${change.url})`
        ),
      }
    },
  },
]

export const defaultMaintenanceDependencies: MaintenanceDependencies = {
  runCommand: runPnpmScript,
  sourceTasks: defaultSourceTasks,
  validateSchemas: runManifestDataHarness,
}

const validationScripts = [
  ['semantic validation', 'test:validate'],
  ['i18n validation', 'validate:i18n'],
  ['data-health snapshot', 'data-health:check'],
] as const

function notify(
  listener: ((event: MaintenanceEvent) => void) | undefined,
  event: MaintenanceEvent
): void {
  listener?.(event)
}

export async function runManifestDataMaintenance(options: {
  rootDir: string
  mode: MaintenanceMode
  sources?: SourceName[]
  observedAt?: string
  dependencies?: MaintenanceDependencies
  onEvent?: (event: MaintenanceEvent) => void
}): Promise<MaintenanceReport> {
  const dependencies = options.dependencies ?? defaultMaintenanceDependencies
  if (options.mode === 'validate' && options.sources) {
    throw new Error('--only can be used only with check or update')
  }
  const selectedSources = options.mode === 'validate' ? [] : (options.sources ?? [...SOURCE_NAMES])
  const unknownSources = selectedSources.filter(
    source => !dependencies.sourceTasks.some(task => task.name === source)
  )
  if (unknownSources.length > 0) {
    throw new Error(`Unknown manifest-data sources: ${unknownSources.join(', ')}`)
  }

  const report: MaintenanceReport = {
    mode: options.mode,
    sources: options.mode === 'validate' ? [] : selectedSources,
    steps: [],
    changes: 0,
    passed: false,
  }

  const addStep = (step: MaintenanceStep): void => {
    report.steps.push(step)
    notify(options.onEvent, { phase: 'finish', name: step.name, step })
  }
  const fail = (name: string, kind: MaintenanceStep['kind'], error: unknown): never => {
    const message = error instanceof Error ? error.message : String(error)
    addStep({ name, kind, status: 'failed', summary: message })
    throw new ManifestDataMaintenanceError(`${name} failed`, report)
  }

  notify(options.onEvent, { phase: 'start', name: 'schema coverage' })
  const schemaReport = dependencies.validateSchemas(options.rootDir)
  if (schemaReport.failures.length > 0) {
    fail('schema coverage', 'validation', new Error(schemaReport.failures.join('\n')))
  }
  addStep({
    name: 'schema coverage',
    kind: 'validation',
    status: 'passed',
    summary: `${schemaReport.documentsChecked} documents, ${schemaReport.schemasChecked} schemas`,
  })

  if (options.mode !== 'update') {
    for (const [name, script] of validationScripts) {
      notify(options.onEvent, { phase: 'start', name })
      try {
        await dependencies.runCommand(options.rootDir, script)
        addStep({ name, kind: 'validation', status: 'passed', summary: script })
      } catch (error) {
        fail(name, 'validation', error)
      }
    }
  }

  if (options.mode !== 'validate') {
    let driftDetected = false
    let sourceFailureDetected = false
    for (const sourceName of selectedSources) {
      const task = dependencies.sourceTasks.find(candidate => candidate.name === sourceName)
      if (!task) throw new Error(`Missing manifest-data source task: ${sourceName}`)
      notify(options.onEvent, { phase: 'start', name: sourceName })
      try {
        const result = await task.run({
          rootDir: options.rootDir,
          write: options.mode === 'update',
          observedAt: options.observedAt ?? currentShanghaiDate(),
        })
        report.changes += result.changes
        const status: StepStatus =
          options.mode === 'check'
            ? result.changes > 0
              ? 'drift'
              : 'current'
            : result.wrote
              ? 'updated'
              : 'current'
        if (status === 'drift') driftDetected = true
        addStep({
          name: sourceName,
          kind: 'source',
          status,
          summary: `${result.checked} checked, ${result.changes} changes`,
          ...(result.details.length > 0 ? { details: result.details } : {}),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        addStep({ name: sourceName, kind: 'source', status: 'failed', summary: message })
        sourceFailureDetected = true
      }
    }

    if (options.mode === 'check' && (driftDetected || sourceFailureDetected)) {
      const failures = report.steps.filter(step => step.status === 'failed').map(step => step.name)
      const drift = report.steps.filter(step => step.status === 'drift').map(step => step.name)
      throw new ManifestDataMaintenanceError(
        [
          ...(failures.length ? [`Source checks failed: ${failures.join(', ')}`] : []),
          ...(drift.length ? [`Source drift detected: ${drift.join(', ')}`] : []),
        ].join('; '),
        report
      )
    }
  }

  if (options.mode === 'update') {
    for (const [name, script] of [
      ['generated data', 'generate'],
      ['data-health report', 'data-health:report'],
    ] as const) {
      notify(options.onEvent, { phase: 'start', name })
      try {
        await dependencies.runCommand(options.rootDir, script)
        addStep({ name, kind: 'derived', status: 'updated', summary: script })
      } catch (error) {
        fail(name, 'derived', error)
      }
    }

    for (const [name, script] of validationScripts) {
      notify(options.onEvent, { phase: 'start', name })
      try {
        await dependencies.runCommand(options.rootDir, script)
        addStep({ name, kind: 'validation', status: 'passed', summary: script })
      } catch (error) {
        fail(name, 'validation', error)
      }
    }

    const failedSources = report.steps
      .filter(step => step.kind === 'source' && step.status === 'failed')
      .map(step => step.name)
    if (failedSources.length > 0) {
      throw new ManifestDataMaintenanceError(
        `Source updates failed: ${failedSources.join(', ')}`,
        report
      )
    }
  }

  report.passed = true
  return report
}
