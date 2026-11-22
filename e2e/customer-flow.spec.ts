import { expect, test, type Page } from '@playwright/test'

async function chooseUnderHeading(page: Page, heading: RegExp) {
  const section = page.getByRole('heading', { level: 2, name: heading }).locator('..')
  const choice = section.getByRole('button').first()
  await expect(choice).toBeVisible()
  await choice.click()
}

async function next(page: Page) {
  await page.getByRole('button', { name: 'המשך' }).click()
}

test.describe.serial('customer flow', () => {
  test('public pages open from the landing site', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'חדר ילדים מעוצב וחלומי בקלות' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'אני רוצה חדר מעוצב עכשיו!' })).toBeVisible()

    await page.getByRole('link', { name: 'אודות' }).first().click()
    await expect(page).toHaveURL(/\/about$/)
    await expect(page.getByRole('heading', { name: 'אודות PETITE DREAMS' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'הדרך שלנו' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'לכל החבילות' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'חדר ילדים מעוצב בגוונים חמים' })).toBeVisible()

    await page.getByRole('link', { name: 'לפני שרוכשים' }).first().click()
    await expect(page).toHaveURL(/\/faq$/)
    await expect(page.getByRole('heading', { name: 'שאלות ותשובות' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'רכישה, מוצרים ומשלוחים' })).toBeVisible()
    await page.getByRole('button', { name: 'מה בעצם מקבלים בחבילת העיצוב?' }).click()
    await expect(page.getByText(/כבר עשינו עבורכם את עבודת החיפוש/)).toBeVisible()

    await page.goto('/terms')
    await expect(page.getByRole('heading', { name: /תקנון ותנאי שימוש/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: '16. יצירת קשר' })).toBeVisible()
    await expect(page.getByText('תשמ"א–1981', { exact: false })).toBeVisible()
    await expect(page.getByText(/הייתי מבקשת מעו"ד/)).toHaveCount(0)
    await expect(page.getByText('[חודש ושנה]')).toHaveCount(0)
    await expect(page.getByText('₪480')).toHaveCount(0)

    await page.goto('/privacy')
    await expect(page.getByRole('heading', { name: 'מדיניות פרטיות' })).toBeVisible()

    await page.goto('/tips')
    await expect(page.getByRole('heading', { name: 'טיפים ועצות שימושיות' })).toBeVisible()
  })

  test('new user signs up and completes a package purchase', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/questionnaire')
    await expect(page.getByRole('heading', { name: 'למי מעצבים את החדר?' })).toBeVisible()
    await expect(page.getByText('01 / 06')).toBeVisible()

    await page.getByPlaceholder('שם הילד/ה').fill('נועה')
    await page.getByRole('button', { name: 'הוספת חדר' }).click()
    await page.getByPlaceholder('שם הילד/ה').nth(1).fill('אייר')
    await expect(page.getByText('01 / 11')).toBeVisible()
    await next(page)

    await expect(page.getByRole('heading', { name: 'קצת על נועה' })).toBeVisible()
    await page.getByRole('button', { name: 'בת', exact: true }).click()
    await next(page)

    await expect(page.getByRole('heading', { name: 'קצת על אייר' })).toBeVisible()
    await page.getByRole('button', { name: 'בן', exact: true }).click()
    await next(page)

    await page.getByRole('button', { name: 'חדר לבת' }).click()
    await next(page)
    await chooseUnderHeading(page, /איזה נושא נועה/)
    await next(page)
    await chooseUnderHeading(page, /סקלת הגוונים לחדר של נועה/)
    await next(page)
    await expect(page.getByRole('heading', { name: /הקיר המרכזי/ })).toBeVisible()
    await page.getByRole('button', { name: /קיר מרכזי בצביעה/ }).click()
    await next(page)

    await page.getByRole('button', { name: 'חדר לבן' }).click()
    await next(page)
    await chooseUnderHeading(page, /איזה נושא אייר/)
    await next(page)
    await chooseUnderHeading(page, /סקלת הגוונים לחדר של אייר/)
    await next(page)
    await page.getByRole('button', { name: /קיר מרכזי בצביעה/ }).click()
    await page.getByRole('button', { name: 'סיום' }).click()

    await expect(page).toHaveURL(/\/preview\/recommended/)
    await expect(page.getByText('חבילת העיצוב של נועה')).toBeVisible()
    await expect(page.getByText('חבילת העיצוב של אייר')).toBeVisible()
    await expect(page.getByText(/חסכתם ₪\d+ בהנחת חדר נוסף/)).toHaveCount(0)
    await expect(page.getByText(/סה״כ \d+ ש״ח - לחודש ל-12 תשלומים/)).toHaveCount(0)
    await expect(page.getByText(/או \d+ בתשלום 1/)).toHaveCount(0)
    const teasers = page.locator('img[src*="/assets/design-packages/"]')
    await expect(teasers.first()).toBeVisible()
    expect(await teasers.count()).toBeGreaterThan(0)
    for (const teaser of await teasers.all()) {
      expect(await teaser.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
    }
    for (const heading of await page.locator('h2, h3').allTextContents()) {
      expect(heading).not.toContain('—')
    }

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
    await expect(page.getByRole('button', { name: 'השלימי רכישה' })).toBeVisible()

    for (const box of await page.getByRole('checkbox').all()) {
      await box.check()
    }
    await page.getByRole('button', { name: 'מאשרת' }).click()
    await page.getByRole('button', { name: 'השלימי רכישה' }).click()

    await expect(page).toHaveURL(/\/account$/, { timeout: 20_000 })
    await expect(page.getByRole('button', { name: 'התנתק' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'החדרים שלי' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'החדר של נועה' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'החדר של אייר' })).toBeVisible()
    await expect(page.getByRole('button', { name: /המקום שלי כשאגדל/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /מעצבים חדר נוסף/ })).toBeVisible()
    await expect(page.getByText('20% הנחה על חדר נוסף')).toBeVisible()
    await page.getByRole('button', { name: /כניסה לחבילה/ }).first().click()
    await expect(page.getByRole('heading', { name: /החדר של/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'רשימת הקניות שלכם' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'עד הפעם הבאה.' })).toBeVisible()
    await page.goBack()
    for (const heading of await page.locator('h2, h3').allTextContents()) {
      expect(heading).not.toContain('—')
    }

    await expect(page.getByRole('heading', { name: 'ארגז הכלים לביצוע מושלם' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'צ׳ק ליסט לביצוע מדויק' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'יוצרים פינות מעוצבות' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'הקיר המרכזי' })).toBeVisible()
    for (const src of ['checklist.png', 'designed-corners.png', 'center-wall.png']) {
      const icon = page.locator(`img[src="/assets/icons/${src}"]`)
      await expect(icon).toBeVisible()
      expect(await icon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
    }
    await page.getByRole('button', { name: /צ׳ק ליסט/ }).click()
    await expect(page).toHaveURL(/\/tips$/)
    await page.goBack()

    await expect(page.getByRole('heading', { name: 'יסודות החדר' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'הפינה המושלמת' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'אחסון חכם' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'משחקים או למידה?' })).toBeVisible()
    await page.getByRole('button', { name: /צפייה בשיעור הפינה המושלמת/ }).click()
    await expect(page.getByText(/וידאו: הפינה המושלמת/)).toBeVisible()

    await expect(page.getByRole('heading', { name: 'הפתקים שלי' })).toBeVisible()
    await page.getByPlaceholder('רוחב הקיר...').fill('240')
    await expect(page.getByPlaceholder('רוחב הקיר...')).toHaveValue('240')
    await page.getByRole('button', { name: 'לרשימה המלאה' }).nth(1).click()
    await page.getByRole('button', { name: 'הוספת שורה' }).click()
    await expect(page.getByPlaceholder('משימה חדשה...')).toBeVisible()
  })

  test('account stays behind login', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'ברוכה שובך' })).toBeVisible()
  })

  test('mobile header keeps the logo off the home link', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await page.getByRole('button', { name: 'תפריט' }).click()
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
