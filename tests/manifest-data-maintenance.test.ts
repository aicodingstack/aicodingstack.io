import { describe, expect, it } from 'vitest'

import {
  type MaintenanceDependencies,
  ManifestDataMaintenanceError,
  runManifestDataMaintenance,
  type SourceTask,
} from '../scripts/manifest-data/lib/maintenance'

function sourceTask(name: SourceTask['name'], changes: number, events: string[]): SourceTask {
  return {
    name,
    async run({ write }) {
      events.push(`${name}:${write ? 'write' : 'check'}`)
      return {
        checked: 1,
        changes,
        wrote: write && changes > 0,
        details: changes ? [`${name} changed`] : [],
      }
    },
  }
}

function dependencies(events: string[], sourceTasks: SourceTask[]): MaintenanceDependencies {
  return {
    validateSchemas() {
      events.push('schema')
      return { documentsChecked: 10, schemasChecked: 2, failures: [] }
    },
    async runCommand(_rootDir, script) {
      events.push(script)
    },
    sourceTasks,
  }
}

describe('manifest-data maintenance harness', () => {
  it('runs the complete deterministic validation suite without source access', async () => {
    const events: string[] = []
    const report = await runManifestDataMaintenance({
      rootDir: '/fixture',
      mode: 'validate',
      dependencies: dependencies(events, []),
    })

    expect(events).toEqual(['schema', 'test:validate', 'validate:i18n', 'data-health:check'])
    expect(report.passed).toBe(true)
    expect(report.sources).toEqual([])
  })

  it('checks selected sources without writing and reports every detected drift', async () => {
    const events: string[] = []
    const taskDependencies = dependencies(events, [
      sourceTask('github-stars', 2, events),
      sourceTask('benchmarks', 1, events),
    ])

    let failure: ManifestDataMaintenanceError | undefined
    try {
      await runManifestDataMaintenance({
        rootDir: '/fixture',
        mode: 'check',
        sources: ['github-stars', 'benchmarks'],
        dependencies: taskDependencies,
      })
    } catch (error) {
      failure = error as ManifestDataMaintenanceError
    }

    expect(events).toEqual([
      'schema',
      'test:validate',
      'validate:i18n',
      'data-health:check',
      'github-stars:check',
      'benchmarks:check',
    ])
    expect(failure).toBeInstanceOf(ManifestDataMaintenanceError)
    expect(failure?.report.changes).toBe(3)
    expect(failure?.report.steps.filter(step => step.status === 'drift')).toHaveLength(2)
  })

  it('updates sources before regenerating and validating derived data', async () => {
    const events: string[] = []
    const report = await runManifestDataMaintenance({
      rootDir: '/fixture',
      mode: 'update',
      sources: ['product-versions'],
      observedAt: '2026-08-31',
      dependencies: dependencies(events, [sourceTask('product-versions', 1, events)]),
    })

    expect(events).toEqual([
      'schema',
      'product-versions:write',
      'generate',
      'data-health:report',
      'test:validate',
      'validate:i18n',
      'data-health:check',
    ])
    expect(report.passed).toBe(true)
    expect(report.changes).toBe(1)
  })

  it('continues read-only source checks after one source fails', async () => {
    const events: string[] = []
    const failingTask: SourceTask = {
      name: 'benchmarks',
      async run() {
        events.push('benchmarks:check')
        throw new Error('upstream mapping changed')
      },
    }
    const taskDependencies = dependencies(events, [
      failingTask,
      sourceTask('model-sources', 0, events),
    ])

    let failure: ManifestDataMaintenanceError | undefined
    try {
      await runManifestDataMaintenance({
        rootDir: '/fixture',
        mode: 'check',
        sources: ['benchmarks', 'model-sources'],
        dependencies: taskDependencies,
      })
    } catch (error) {
      failure = error as ManifestDataMaintenanceError
    }

    expect(events.at(-2)).toBe('benchmarks:check')
    expect(events.at(-1)).toBe('model-sources:check')
    expect(failure?.report.steps.at(-1)).toMatchObject({
      name: 'model-sources',
      status: 'current',
    })
  })

  it('regenerates and validates successful writes when another update source fails', async () => {
    const events: string[] = []
    const failingTask: SourceTask = {
      name: 'product-versions',
      async run() {
        events.push('product-versions:write')
        throw new Error('registry unavailable')
      },
    }
    const taskDependencies = dependencies(events, [
      failingTask,
      sourceTask('github-stars', 1, events),
    ])

    let failure: ManifestDataMaintenanceError | undefined
    try {
      await runManifestDataMaintenance({
        rootDir: '/fixture',
        mode: 'update',
        sources: ['product-versions', 'github-stars'],
        dependencies: taskDependencies,
      })
    } catch (error) {
      failure = error as ManifestDataMaintenanceError
    }

    expect(events).toContain('github-stars:write')
    expect(events).toContain('generate')
    expect(events.at(-1)).toBe('data-health:check')
    expect(failure?.report.steps).toContainEqual(
      expect.objectContaining({ name: 'product-versions', status: 'failed' })
    )
  })
})
