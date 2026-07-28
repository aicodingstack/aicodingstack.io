import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'

describe('validate: ranking data schemas', () => {
  it.each([
    'model-intelligence-index',
    'model-price-intelligence-index',
  ])('validates the %s configuration', dataName => {
    const rootDir = path.resolve(__dirname, '../..')
    const schema = JSON.parse(
      fs.readFileSync(path.join(rootDir, `data/$schemas/${dataName}.schema.json`), 'utf8')
    )
    const data = JSON.parse(fs.readFileSync(path.join(rootDir, `data/${dataName}.json`), 'utf8'))
    const ajv = new Ajv2020({ allErrors: true })

    addFormats(ajv)

    const validate = ajv.compile(schema)
    const valid = validate(data)

    expect(validate.errors).toEqual(null)
    expect(valid).toBe(true)
  })
})
