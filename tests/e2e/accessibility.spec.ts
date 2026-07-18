import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'

const blockingImpacts = new Set(['serious', 'critical'])

async function expectNoBlockingViolations(page: Page, include?: string): Promise<void> {
  const builder = new AxeBuilder({ page })
  if (include) builder.include(include)
  const results = await builder.analyze()
  const blockingViolations = results.violations
    .filter(violation => violation.impact && blockingImpacts.has(violation.impact))
    .map(violation => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      targets: violation.nodes.map(node => node.target.join(' ')),
    }))

  expect(blockingViolations, JSON.stringify(blockingViolations, null, 2)).toEqual([])
}

test('search dialog has no serious accessibility violations', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('button', { name: /Search/ })
    .first()
    .click()
  await expect(page.getByPlaceholder('Type to search...')).toBeVisible()

  await expectNoBlockingViolations(page, '[role="dialog"]')
})

test('language menu has no serious accessibility violations', async ({ page }) => {
  await page.goto('/models/gpt-5-2')
  await page.getByRole('button', { name: 'Select language' }).click()
  await expect(page.getByRole('menuitemradio', { name: /简体中文/ })).toBeVisible()

  await expectNoBlockingViolations(page, '[role="menu"]')
})

test('model comparison table has no serious accessibility violations', async ({ page }) => {
  await page.goto('/models/compare/gemini-3-flash-vs-gpt-5-2')
  await expect(page.getByRole('table').first()).toBeVisible()

  await expectNoBlockingViolations(page)
})

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('has no serious accessibility violations when expanded', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await expect(page.getByRole('link', { name: 'Manifesto' })).toBeVisible()

    await expectNoBlockingViolations(page, 'header')
  })
})
