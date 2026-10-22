import { expect, test, type Page } from '@playwright/test'

const PUBLIC_PAGES = [
  { path: '/', heading: 'עיצוב חדר ילדים קסום בקלות' },
  { path: '/about', heading: 'אודות PETITE DREAMS' },
  { path: '/faq', heading: 'שאלות ותשובות' },
  { path: '/terms', heading: /תקנון ותנאי שימוש/ },
  { path: '/privacy', heading: 'מדיניות פרטיות' },
  { path: '/tips', heading: 'טיפים ועצות שימושיות' },
  { path: '/questionnaire', heading: 'מה שם הילד/ה שלך?' },
  { path: '/login', heading: 'ברוכה שובך' },
]

const PREVIEW =
  '/preview/recommended?childName=%D7%90%D7%A8%D7%93&gender=boy&age=1&theme=%D7%94%D7%A8%D7%A4%D7%AA%D7%A7%D7%90%D7%95%D7%AA&colorPreference=%D7%97%D7%9E%D7%99%D7%9D%20%D7%98%D7%91%D7%A2%D7%99%D7%99%D7%9D&wallDesignOption=paint'

type Problem = { page: string; kind: string; detail: string }

function attachMonitors(page: Page, problems: Problem[], label: string) {
  page.on('pageerror', (error) => {
    problems.push({ page: label, kind: 'pageerror', detail: error.message })
  })
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (/favicon|Download the React DevTools/i.test(text)) return
    problems.push({ page: label, kind: 'console', detail: text })
  })
  page.on('response', (response) => {
    const status = response.status()
    if (status < 400) return
    const url = response.url()
    if (!url.startsWith('http://127.0.0.1:5173')) return
    if (url.includes('favicon.ico')) return
    problems.push({ page: label, kind: `http ${status}`, detail: url })
  })
}

async function layoutProblems(page: Page, label: string): Promise<Problem[]> {
  return page.evaluate((current) => {
    const found: { page: string; kind: string; detail: string }[] = []
    const root = document.documentElement
    if (root.scrollWidth > root.clientWidth + 2) {
      found.push({
        page: current,
        kind: 'overflow',
        detail: `scrollWidth ${root.scrollWidth} > clientWidth ${root.clientWidth}`,
      })
    }
    for (const image of Array.from(document.images)) {
      if (!image.complete || image.naturalWidth > 0) continue
      if (!image.src.startsWith(location.origin)) continue
      found.push({ page: current, kind: 'broken image', detail: image.src })
    }
    const text = document.body.innerText
    if (text.includes('info@petite-dreams.com')) {
      found.push({ page: current, kind: 'copy', detail: 'old info@ email is still visible' })
    }
    if (text.includes('הייתי מבקשת')) {
      found.push({ page: current, kind: 'copy', detail: 'internal legal note is visible' })
    }
    return found
  }, label)
}

async function next(page: Page) {
  await page.getByRole('button', { name: 'הבא' }).click()
}

test.describe.serial('qa audit', () => {
  test('every public page renders without errors, overflow, or broken local images', async ({ page }) => {
    test.setTimeout(120_000)
    const problems: Problem[] = []
    attachMonitors(page, problems, 'public')

    for (const entry of PUBLIC_PAGES) {
      await page.goto(entry.path)
      await expect(page.getByRole('heading', { name: entry.heading }).first()).toBeVisible()
      await expect(page.getByRole('link', { name: 'PETITE DREAMS' })).toBeVisible()
      problems.push(...(await layoutProblems(page, entry.path)))
    }

    await page.goto(PREVIEW)
    await expect(page.getByRole('heading', { name: 'חבילת העיצוב של ארד' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'לרכישה מיידית' })).toBeVisible()
    await expect(page.getByText('495₪').or(page.getByText(/₪/)).first()).toBeVisible()
    problems.push(...(await layoutProblems(page, PREVIEW)))

    await page.goto('/does-not-exist')
    await expect(page).toHaveURL(/\/$/)

    expect(problems, problems.map((item) => `${item.page} [${item.kind}] ${item.detail}`).join('\n')).toEqual([])
  })

  test('header and footer reach every linked page', async ({ page }) => {
    await page.goto('/')
    for (const name of ['אודות', 'לפני שרוכשים', 'בית']) {
      await page.locator('header').getByRole('link', { name, exact: true }).click()
      await expect(page.locator('h1').first()).toBeVisible()
      await page.goto('/')
    }
    await page.locator('header').getByRole('link', { name: 'התחבר' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/')
    const footer = page.locator('footer')
    await footer.getByRole('link', { name: 'התחל' }).click()
    await expect(page).toHaveURL(/\/questionnaire$/)
    await page.goto('/')
    await footer.getByRole('link', { name: 'תנאי שימוש' }).click()
    await expect(page).toHaveURL(/\/terms$/)
    await page.goto('/')
    await footer.getByRole('link', { name: 'מדיניות פרטיות' }).click()
    await expect(page).toHaveURL(/\/privacy$/)
    await expect(footer.getByRole('link', { name: 'studio@petite-dreams.com' })).toHaveAttribute(
      'href',
      'mailto:studio@petite-dreams.com',
    )
  })

  test('questionnaire blocks empty answers and keeps the redesigned steps', async ({ page }) => {
    await page.goto('/questionnaire')
    await expect(page.getByRole('button', { name: 'הבא' })).toBeDisabled()
    await expect(page.locator('[data-percent="17%"]')).toBeVisible()

    await page.getByPlaceholder('הכנס/י את שם הילד/ה').fill('ארד')
    await next(page)
    await expect(page.getByRole('button', { name: 'הבא' })).toBeDisabled()
    await page.getByRole('button', { name: 'בן', exact: true }).click()
    await next(page)
    await next(page)

    const theme = page.getByRole('heading', { level: 2 }).locator('..').getByRole('button').first()
    await theme.click()
    await expect(theme.locator('svg')).toHaveCount(2)
    await next(page)

    await expect(page.getByRole('heading', { name: 'בחרי את סקלת הגוונים שלך' })).toBeVisible()
    await expect(page.getByText('סגנונות מותאמים לחלומות גדולים')).toBeVisible()
    await expect(page.getByText(/כל סקלת צבעים נבחרה בקפידה/)).toBeVisible()
    await page.getByRole('heading', { level: 2 }).locator('..').getByRole('button').first().click()
    await next(page)

    await expect(page.getByRole('heading', { name: /הקיר המרכזי של ארד/ })).toBeVisible()
    await expect(page.locator('img[src="/assets/wall-panel.jpg"]')).toBeVisible()
    await expect(page.locator('img[src="/assets/wall-paint.jpg"]')).toBeVisible()
    const covering = page.getByRole('button', { name: /חיפוי קיר דקורטיבי/ })
    const paint = page.getByRole('button', { name: /קיר כוח בצביעה/ })
    const coveringBox = await covering.boundingBox()
    const paintBox = await paint.boundingBox()
    expect(coveringBox && paintBox && coveringBox.x > paintBox.x).toBeTruthy()
    await covering.click()
    await page.getByRole('button', { name: 'סיים' }).click()
    await expect(page).toHaveURL(/\/preview\/recommended/)
    await expect(page.getByText('חבילת העיצוב של ארד')).toBeVisible()
    await expect(page.getByText('חיפוי קיר דקורטיבי')).toHaveCount(0)
  })

  test('content pages keep the approved copy', async ({ page }) => {
    await page.goto('/about')
    for (const phrase of ['חללי מגורים', 'סימני שאלה', 'מדף ריק', 'בכמה עלה', 'ברוכים הבאים ל־PETITE DREAMS']) {
      await expect(page.getByText(phrase, { exact: false })).toBeVisible()
    }

    await page.goto('/faq')
    await expect(page.getByRole('button', { name: /\?/ })).toHaveCount(16)
    await page.getByRole('button', { name: 'ומה אם יש לי בעיה טכנית?' }).click()
    await expect(page.getByText(/שירות התמיכה מיועד לנושאים טכניים/)).toBeVisible()
    await expect(page.getByRole('link', { name: 'התחילו עכשיו' })).toHaveAttribute('href', '/questionnaire')

    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: '1. כללי' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '16. יצירת קשר' })).toBeVisible()
    await expect(page.getByText('בני 18 ומעלה')).toBeVisible()
    await expect(page.getByText('תשמ"א–1981')).toBeVisible()
    await expect(page.getByText('עודכן לאחרונה: אוקטובר 2026')).toBeVisible()
    await expect(page.getByText('[חודש ושנה]')).toHaveCount(0)
  })

  test('protected routes stay behind login', async ({ page }) => {
    for (const path of ['/account', '/checkout/any-package', '/package/any-package', '/admin', '/admin/collage']) {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login$/)
    }
    await page.getByRole('button', { name: 'התחברי' }).click()
    await expect(page.getByText('אנא הכניסי גם אימייל וגם סיסמה')).toBeVisible()
    await page.getByPlaceholder('your@email.com').fill('nobody@example.com')
    await page.getByPlaceholder('••••••••').fill('123')
    await page.getByRole('button', { name: 'התחברי' }).click()
    await expect(page.getByText('הסיסמה חייבת להכיל לפחות 6 תווים')).toBeVisible()
  })

  test('mobile layouts do not overflow and the header stays usable', async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 390, height: 844 })
    const problems: Problem[] = []
    attachMonitors(page, problems, 'mobile')

    for (const path of ['/', '/about', '/faq', '/questionnaire', '/terms', PREVIEW]) {
      await page.goto(path)
      await expect(page.locator('h1, h2').first()).toBeVisible()
      problems.push(...(await layoutProblems(page, `mobile ${path}`)))
    }

    await page.goto('/')
    const logo = await page.getByRole('link', { name: 'PETITE DREAMS' }).boundingBox()
    const home = await page.locator('header').getByRole('link', { name: 'בית', exact: true }).boundingBox()
    expect(logo && home).toBeTruthy()
    if (logo && home) {
      const overlaps = !(
        logo.x + logo.width <= home.x ||
        home.x + home.width <= logo.x ||
        logo.y + logo.height <= home.y ||
        home.y + home.height <= logo.y
      )
      expect(overlaps).toBe(false)
    }

    expect(problems, problems.map((item) => `${item.page} [${item.kind}] ${item.detail}`).join('\n')).toEqual([])
  })

  test('a purchase unlocks the account and the package page', async ({ page }) => {
    test.setTimeout(180_000)
    const problems: Problem[] = []
    attachMonitors(page, problems, 'purchase')

    await page.goto('/questionnaire')
    await page.getByPlaceholder('הכנס/י את שם הילד/ה').fill('נועה')
    await next(page)
    await page.getByRole('button', { name: 'בת', exact: true }).click()
    await next(page)
    await next(page)
    await page.getByRole('heading', { level: 2 }).locator('..').getByRole('button').first().click()
    await next(page)
    await page.getByRole('heading', { level: 2 }).locator('..').getByRole('button').first().click()
    await next(page)
    await page.getByRole('button', { name: /קיר כוח בצביעה/ }).click()
    await page.getByRole('button', { name: 'סיים' }).click()
    await expect(page).toHaveURL(/\/preview\/recommended/)

    await page.getByRole('button', { name: 'לרכישה מיידית' }).click()
    await expect(page).toHaveURL(/\/login$/)
    const email = `qa.petite.${Date.now()}@example.com`
    await page.getByPlaceholder('your@email.com').fill(email)
    await page.getByPlaceholder('••••••••').fill('Qa-flow-12345')
    await page.getByRole('button', { name: 'הירשמי' }).click()

    await expect(page.getByRole('heading', { name: 'תשלום מאובטח' })).toBeVisible()
    await page.getByRole('button', { name: /שלמי/ }).click()
    await expect(page.getByRole('heading', { name: 'תשלום מאובטח' })).toBeVisible()
    for (const box of await page.getByRole('checkbox').all()) await box.check()
    await page.getByRole('button', { name: /שלמי/ }).click()

    await expect(page).toHaveURL(/\/(account|package\/)/, { timeout: 20_000 })
    if (!page.url().includes('/package/')) {
      await page.getByRole('button', { name: 'הצגת חבילה מלאה' }).click()
    }
    await expect(page).toHaveURL(/\/package\//)
    await expect(page.getByText('בחרי חבילה')).toBeVisible()
    await expect(page.getByText('כך הכל מתחבר יחד')).toBeVisible()
    await expect(page.getByText('שיתוף התוצאות שלכם')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'עד הפעם הבאה!' })).toBeVisible()
    const item = page.getByRole('checkbox', { name: /סימון/ }).first()
    if ((await item.count()) > 0) {
      await item.check()
      await page.reload()
      await expect(page.getByRole('checkbox', { name: /סימון/ }).first()).toBeChecked()
    }
    problems.push(...(await layoutProblems(page, '/package')))

    await page.goto('/account')
    await expect(page.getByText(/מושלם עבור נועה/)).toBeVisible()
    await expect(page.getByText('המקום שלי כשאגדל')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ארגז הכלים לביצוע מושלם' })).toBeVisible()
    await expect(page.getByText('הצעות מיוחדות')).toBeVisible()
    await page.getByPlaceholder('רוחב הקיר...').fill('240')
    await page.reload()
    await expect(page.getByPlaceholder('רוחב הקיר...')).toHaveValue('240')
    problems.push(...(await layoutProblems(page, '/account')))

    expect(problems, problems.map((item) => `${item.page} [${item.kind}] ${item.detail}`).join('\n')).toEqual([])
  })
})
