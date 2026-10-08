import { expect, test, type Page } from '@playwright/test'

async function chooseUnderHeading(page: Page, heading: RegExp) {
  const section = page.getByRole('heading', { level: 2, name: heading }).locator('..')
  const choice = section.getByRole('button').first()
  await expect(choice).toBeVisible()
  await choice.click()
}

async function next(page: Page) {
  await page.getByRole('button', { name: 'הבא' }).click()
}

test.describe.serial('customer flow', () => {
  test('public pages open from the landing site', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'עיצוב חדר ילדים בקלות' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'אני רוצה חדר מעוצב עכשיו' })).toBeVisible()

    await page.getByRole('link', { name: 'אודות' }).first().click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.getByRole('img', { name: 'אודות PETITE DREAMS' })).toBeVisible()

    await page.goto('/faq')
    await expect(page.getByRole('heading', { name: 'שאלות ותשובות' })).toBeVisible()

    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: /תקנון שימוש/ })).toBeVisible()

    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'מדיניות פרטיות' })).toBeVisible()

    await page.goto('/tips')
    await expect(page.getByRole('heading', { name: 'טיפים ועצות שימושיות' })).toBeVisible()
  })

  test('new user signs up and completes a package purchase', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/questionnaire')
    await expect(page.getByText('שלב 1 מתוך 6')).toBeVisible()

    await page.getByPlaceholder('הכנס/י את שם הילד/ה').fill('נועה')
    await next(page)

    await page.getByRole('button', { name: 'בת', exact: true }).click()
    await next(page)

    await expect(page.getByRole('heading', { name: /בת כמה נועה/ })).toBeVisible()
    await page.getByRole('button', { name: '+ הוסף אח/אחות' }).click()
    await page.getByPlaceholder('שם הילד/ה').fill('אייר')
    await page.getByRole('button', { name: 'בן', exact: true }).click()
    await page.getByRole('button', { name: 'הוסף', exact: true }).click()
    await expect(page.getByText('אייר (5 שנים, בן)')).toBeVisible()
    await expect(page.getByText('שלב 3 מתוך 9')).toBeVisible()
    await next(page)

    await chooseUnderHeading(page, /איזה נושא נועה/)
    await next(page)

    await chooseUnderHeading(page, /איזה גוון וצבעים של נועה/)
    await next(page)

    await page.getByRole('button', { name: /קיר כוח בצביעה/ }).click()
    await next(page)

    await chooseUnderHeading(page, /איזה נושא אייר/)
    await next(page)

    await chooseUnderHeading(page, /איזה גוון וצבעים של אייר/)
    await next(page)

    await page.getByRole('button', { name: /קיר כוח בצביעה/ }).click()
    await page.getByRole('button', { name: 'סיים' }).click()

    await expect(page).toHaveURL(/\/preview\/recommended/)
    await expect(page.getByText('חבילת העיצוב של נועה')).toBeVisible()
    await expect(page.getByText('חבילת העיצוב של אייר')).toBeVisible()
    await expect(page.getByText(/חסכתם ₪\d+ בהנחת אחים/)).toBeVisible()
    await expect(page.getByText(/סה״כ \d+ ש״ח - לחודש ל-6 תשלומים/)).toBeVisible()
    await expect(page.getByText(/או \d+ בתשלום 1/)).toBeVisible()

    await page.getByRole('button', { name: 'לרכישה מיידית' }).first().click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'יצירת חשבון' })).toBeVisible()
    await expect(page.getByText('הירשמי כדי לשמור את החבילה ולהמשיך לרכישה')).toBeVisible()

    await page.getByRole('button', { name: 'הירשמי' }).click()
    await expect(page.getByText('אנא הכניסי גם אימייל וגם סיסמה')).toBeVisible()

    const email = `e2e.petite.${Date.now()}@example.com`
    await page.getByPlaceholder('your@email.com').fill(email)
    await page.getByPlaceholder('••••••••').fill('E2e-flow-12345')
    await page.getByRole('button', { name: 'הירשמי' }).click()

    await expect(page.getByRole('heading', { name: 'תשלום מאובטח' })).toBeVisible()
    await expect(page.getByText('נועה').first()).toBeVisible()
    await page.getByText('6 תשלומים', { exact: true }).click()
    await expect(page.getByRole('button', { name: /× 6 תשלומים/ })).toBeVisible()

    for (const box of await page.getByRole('checkbox').all()) {
      await box.check()
    }
    await page.getByRole('button', { name: /שלמי/ }).click()

    await expect(page).toHaveURL(/\/account$/, { timeout: 20_000 })
    await expect(page.getByRole('button', { name: 'התנתק' })).toBeVisible()
    await expect(page.getByText(/מותאם עבור נועה/)).toBeVisible()
    await expect(page.getByText(/מותאם עבור אייר/)).toBeVisible()
  })

  test('account stays behind login', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'ברוכה שובך' })).toBeVisible()
  })

  test('mobile header keeps the logo off the home link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const logo = page.getByRole('link', { name: 'PETITE DREAMS' })
    const home = page.locator('header').getByRole('link', { name: 'בית', exact: true })
    const logoBox = await logo.boundingBox()
    const homeBox = await home.boundingBox()

    expect(logoBox).not.toBeNull()
    expect(homeBox).not.toBeNull()
    if (!logoBox || !homeBox) return

    const overlaps = !(
      logoBox.x + logoBox.width <= homeBox.x ||
      homeBox.x + homeBox.width <= logoBox.x ||
      logoBox.y + logoBox.height <= homeBox.y ||
      homeBox.y + homeBox.height <= logoBox.y
    )
    expect(overlaps).toBe(false)
  })
})
