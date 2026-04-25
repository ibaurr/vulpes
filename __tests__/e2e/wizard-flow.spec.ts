import { test, expect } from '@playwright/test'

test.describe('Script Engine Wizard Flow', () => {
  test('completes the full wizard: Discovery → Research → Review → Config → Generation', async ({ page }) => {
    // Step 1: Navigate to the app
    await page.goto('/')
    
    // Verify the landing page loaded
    await expect(page.getByRole('heading', { name: /Vulpes lagopus/i })).toBeVisible()
    
    // Step 2: Discovery — enter a topic
    const topicInput = page.getByPlaceholder(/e\.g\./i)
    await expect(topicInput).toBeVisible()
    await topicInput.fill('The invention of the printing press')
    
    const researchButton = page.getByRole('button', { name: /Research/i })
    await expect(researchButton).toBeEnabled()
    await researchButton.click()

    // Step 3: Researching — wait for the agentic research phase
    // The terminal-style thought stream should appear
    await expect(page.getByText(/Researching the web/i)).toBeVisible()
    await expect(page.getByText(/Agentic Thought Stream/i)).toBeVisible()

    // Wait for research to complete and auto-advance to Review
    // This is the longest step — the LLM call can take up to 30s
    await expect(page.getByText(/Fact Review/i)).toBeVisible({ timeout: 45_000 })

    // Step 4: Review — verify facts are displayed, then approve
    // Facts should be rendered as checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()
    const factCount = await checkboxes.count()
    expect(factCount).toBeGreaterThanOrEqual(3) // API returns 5-8 facts

    // Approve & continue
    const approveButton = page.getByRole('button', { name: /Approve & Continue/i })
    await approveButton.click()

    // Step 5: Config — select tone and length, then generate
    await expect(page.getByText(/Script Configuration/i)).toBeVisible()
    
    // Use defaults (Neutral / 3 min) and generate
    const generateButton = page.getByRole('button', { name: /Generate Final Script/i })
    await generateButton.click()

    // Step 6: Generation — verify the script starts streaming
    // Wait for some content to appear in the script area
    await expect(page.locator('.prose').first()).toBeVisible({ timeout: 30_000 })
    
    // Wait for generation to complete (streaming indicator disappears)
    await expect(page.getByText(/Generating\.\.\./i)).toBeHidden({ timeout: 60_000 })

    // Verify post-generation UI elements
    await expect(page.getByRole('button', { name: /Copy/i })).toBeEnabled()
    await expect(page.getByRole('button', { name: /Export/i })).toBeEnabled()
    await expect(page.getByText(/words/i)).toBeVisible()
    await expect(page.getByText(/narration/i)).toBeVisible()

    // Verify revision input appeared
    await expect(page.getByPlaceholder(/Make the intro/i)).toBeVisible()
    
    // Verify Start Over button works
    const startOverButton = page.getByRole('button', { name: /Start Over/i })
    await expect(startOverButton).toBeVisible()
  })

  test('landing page renders correctly', async ({ page }) => {
    await page.goto('/')
    
    // Page title
    await expect(page).toHaveTitle(/Vulpes lagopus/i)
    
    // Main heading
    await expect(page.getByRole('heading', { name: /Vulpes lagopus.*Script Engine/i })).toBeVisible()
    
    // Discovery step is active
    await expect(page.getByPlaceholder(/e\.g\./i)).toBeVisible()
    
    // History button is present
    await expect(page.getByRole('button', { name: /History/i })).toBeVisible()

    // Research button is disabled when input is empty
    const researchButton = page.getByRole('button', { name: /Research/i })
    await expect(researchButton).toBeDisabled()
  })
})
