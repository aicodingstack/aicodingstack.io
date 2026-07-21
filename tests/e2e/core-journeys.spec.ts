import { expect, test } from '@playwright/test'

test('search opens a model detail page', async ({ page }) => {
  await page.goto('/search?q=GPT-5.2')

  const result = page.getByRole('link', { name: /GPT-5\.2/ }).first()
  await expect(result).toBeVisible()
  await result.click()

  await expect(page).toHaveURL(/\/models\/gpt-5-2$/)
  await expect(page.getByRole('heading', { name: 'GPT-5.2', level: 1 })).toBeVisible()
})

test('model comparison selection persists across routes', async ({ page }) => {
  await page.goto('/models')

  const geminiCompare = page.getByTitle('Compare: Gemini 3 Flash', { exact: true })
  const gptCompare = page.getByTitle('Compare: GPT-5.2', { exact: true })

  await geminiCompare.click()
  await gptCompare.click()

  const compareLink = page.getByRole('link', { name: /Compare \(2\/2\)/ })
  await expect(compareLink).toBeVisible()
  await compareLink.click()

  await expect(page).toHaveURL(/\/models\/compare\/gemini-3-flash-vs-gpt-5-2$/)
  await expect(page.locator('select').nth(0)).toHaveValue('gemini-3-flash')
  await expect(page.locator('select').nth(1)).toHaveValue('gpt-5-2')

  await page.goto('/models')
  await expect(geminiCompare).toHaveAttribute('aria-pressed', 'true')
  await expect(gptCompare).toHaveAttribute('aria-pressed', 'true')
})

test('language switching preserves the current detail route', async ({ page }) => {
  await page.goto('/models/gpt-5-2')
  await page.getByRole('button', { name: 'Select language' }).click()
  await page.getByRole('menuitemradio', { name: '简体中文' }).click()

  await expect(page).toHaveURL(/\/zh-Hans\/models\/gpt-5-2$/)
  await expect(page.getByRole('heading', { name: 'GPT-5.2', level: 1 })).toBeVisible()
})
