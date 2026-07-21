#!/usr/bin/env node

/**
 * Field Tracker - Tracks evidence-gathering attempts and unresolved fields.
 */

import { RETRY_CONFIG } from './config.mjs'

export class FieldTracker {
  constructor(maxAttempts = RETRY_CONFIG.maxAttempts) {
    this.maxAttempts = maxAttempts
    this.fields = new Map()
  }

  /**
   * Start tracking a field attempt
   * @param {string} fieldPath - Dot-notation path (e.g., 'communityUrls.discord')
   */
  attempt(fieldPath) {
    if (!this.fields.has(fieldPath)) {
      this.fields.set(fieldPath, {
        attempts: 0,
        value: null,
        status: 'pending',
        reason: null,
      })
    }

    const field = this.fields.get(fieldPath)
    field.attempts += 1
    field.status = 'attempting'

    return field.attempts
  }

  /**
   * Check if field should be retried
   * @param {string} fieldPath
   * @returns {boolean}
   */
  shouldRetry(fieldPath) {
    const field = this.fields.get(fieldPath)
    if (!field) return true // First attempt
    return field.attempts < this.maxAttempts && field.status !== 'extracted'
  }

  /**
   * Mark field extraction as successful
   * @param {string} fieldPath
   * @param {*} value - Extracted value
   */
  markSuccess(fieldPath, value) {
    const field = this.fields.get(fieldPath) || {}
    field.value = value
    field.status = 'extracted'
    this.fields.set(fieldPath, field)
  }

  /**
   * Mark field extraction as failed
   * @param {string} fieldPath
   * @param {string} reason - Why it failed
   */
  markFailed(fieldPath, reason) {
    const field = this.fields.get(fieldPath) || { attempts: this.maxAttempts }
    field.value = null
    field.status = 'failed'
    field.reason = reason
    this.fields.set(fieldPath, field)
  }

  /**
   * Get current status of a field
   * @param {string} fieldPath
   * @returns {object|null}
   */
  getStatus(fieldPath) {
    return this.fields.get(fieldPath) || null
  }

  /**
   * Return a report-safe note for a failed field.
   * @param {string} fieldPath
   * @returns {string}
   */
  generateUnresolvedNote(fieldPath) {
    const field = this.fields.get(fieldPath)
    if (!field || field.status !== 'failed') {
      return ''
    }

    const attempts = field.attempts || this.maxAttempts
    const reason = field.reason || 'Not found'

    return `Unresolved after ${attempts} attempts: ${reason}`
  }

  /**
   * Get completion report
   * @returns {object}
   */
  getReport() {
    const report = {
      total: this.fields.size,
      extracted: 0,
      failed: 0,
      pending: 0,
      fields: {
        extracted: [],
        failed: [],
        pending: [],
      },
    }

    for (const [fieldPath, field] of this.fields.entries()) {
      if (field.status === 'extracted') {
        report.extracted++
        report.fields.extracted.push(fieldPath)
      } else if (field.status === 'failed') {
        report.failed++
        report.fields.failed.push({
          path: fieldPath,
          attempts: field.attempts,
          reason: field.reason,
        })
      } else {
        report.pending++
        report.fields.pending.push(fieldPath)
      }
    }

    return report
  }

  /**
   * Generate formatted completion report
   * @param {string} manifestPath - Path to manifest file
   * @returns {string}
   */
  generateCompletionReport(manifestPath) {
    const report = this.getReport()
    const status = report.failed > 0 ? 'DRAFT' : 'COMPLETE'

    let output = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    output += '📊 Manifest Automation Report\n'
    output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    output += `Status: ${status}`

    if (report.failed > 0) {
      output += ` (${report.failed} field${report.failed > 1 ? 's' : ''} incomplete)\n`
    } else {
      output += '\n'
    }

    output += '\n'

    if (report.extracted > 0) {
      output += `✅ Successfully Extracted (${report.extracted} field${report.extracted > 1 ? 's' : ''})\n`
    }

    if (report.failed > 0) {
      output += `\n❌ Unresolved Fields (${report.failed} field${report.failed > 1 ? 's' : ''}):\n`
      report.fields.failed.forEach((field, index) => {
        output += `   ${index + 1}. ${field.path} (${field.attempts} attempts)\n`
        output += `      Reason: ${field.reason}\n`
        if (index < report.fields.failed.length - 1) output += '\n'
      })
    }

    output += '\n📝 Next Steps:\n'
    output += `1. Review manifest file: ${manifestPath}\n`

    if (report.failed > 0) {
      output +=
        '2. Resolve required fields from authoritative sources; do not guess or add JSON comments\n'
      output += '3. Update provenance and verification metadata\n'
      output += '4. Run validation: npm run test:validate\n'
    } else {
      output += '2. Update verified field if data confirmed accurate\n'
      output += '3. Run validation: npm run test:validate\n'
    }

    return output
  }

  /**
   * Reset tracker
   */
  reset() {
    this.fields.clear()
  }

  /**
   * Export tracker state
   * @returns {object}
   */
  export() {
    return {
      maxAttempts: this.maxAttempts,
      fields: Object.fromEntries(this.fields),
    }
  }

  /**
   * Import tracker state
   * @param {object} data
   */
  import(data) {
    this.maxAttempts = data.maxAttempts || this.maxAttempts
    this.fields = new Map(Object.entries(data.fields || {}))
  }
}
