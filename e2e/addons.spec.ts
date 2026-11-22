import { expect, test, type Page, type Route } from '@playwright/test'

/**
 * Add-on flows against a mocked design-back API and Supabase.
 * Run: npm run test:e2e:mocked
 */

const USER_ID = '11111111-1111-4111-8111-111111111111'

function fakeJwt() {
  const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const exp = Math.floor(Date.now() / 1000) + 3600
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER_ID, exp, role: 'authenticated', email: 'parent@example.com' })}.sig`
}

interface Profile {
  is_admin?: boolean
  children?: unknown[]
  purchased_packages?: string[]
}

async function signIn(page: Page, profile: Profile = {}) {
  const token = fakeJwt()
  const session = {
    access_token: token,
    refresh_token: 'refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id: USER_ID, email: 'parent@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} },
  }
  await page.addInitScript((value) => {
    localStorage.setItem('sb-mock-auth-token', value)
    localStorage.setItem('pd_cookie_consent', 'accepted')
  }, JSON.stringify(session))

  await page.route('https://mock.supabase.co/rest/v1/petite_profiles**', (route) =>
    route.fulfill({
      json: [
        {
          id: USER_ID,
          email: 'parent@example.com',
          name: 'הורה',
          is_admin: profile.is_admin ?? false,
          purchased_packages: profile.purchased_packages ?? [],
          children: profile.children ?? [],
        },
      ],
    }),
  )
}

async function mockSupabase(page: Page) {
  await page.route('https://mock.supabase.co/**', (route: Route) => {
    const url = route.request().url()
    if (url.includes('/auth/v1/user')) return route.fulfill({ json: { id: USER_ID, email: 'parent@example.com' } })
    if (url.includes('/rest/v1/app_settings')) return route.fulfill({ json: [] })
    if (url.includes('/rest/v1/')) return route.fulfill({ json: [] })
    return route.fulfill({ json: {} })
  })
}

test.beforeEach(async ({ page }) => {
  await mockSupabase(page)
})

test('referral link is recorded only after cookie consent', async ({ page }) => {
  const visits: unknown[] = []
  await page.route('**/api/referrals/visit', async (route) => {
    visits.push(route.request().postDataJSON())
    await route.fulfill({ json: { tracked: true } })
  })

  await page.goto('/?ref=maya')
  await expect(page).toHaveURL(/127\.0\.0\.1:5174\/$/)
  await expect(page.getByRole('button', { name: 'מאשרת' })).toBeVisible()
  expect(visits).toHaveLength(0)

  await page.getByRole('button', { name: 'מאשרת' }).click()
  await expect.poll(() => visits.length).toBe(1)
  expect(visits[0]).toMatchObject({ ref: 'maya' })
  const stored = await page.evaluate(() => localStorage.getItem('pd_referral'))
  expect(JSON.parse(stored!)).toMatchObject({ ref: 'maya' })
})

test('home page and menu link to the gift voucher', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'שובר מתנה' })).toBeVisible()
  await page.getByRole('link', { name: 'לרכישת שובר מתנה' }).click()
  await expect(page).toHaveURL(/\/gift$/)
  await expect(page.getByRole('link', { name: 'שובר מתנה' }).first()).toBeVisible()
})

test('buying a gift voucher shows the voucher and WhatsApp share', async ({ page }) => {
  await signIn(page)
  await page.route('**/api/vouchers/prices', (route) =>
    route.fulfill({ json: { maxPackages: 5, prices: { 1: 660, 2: 1188, 3: 1716, 4: 2244, 5: 2772 } } }),
  )
  let body: Record<string, unknown> | null = null
  await page.route('**/api/vouchers', async (route) => {
    body = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      json: {
        orderNumber: 1042,
        voucher: {
          id: 'v1',
          code: 'PD-7KQ4M9XA',
          packagesCount: 3,
          recipientNames: 'ליאב, ניר ואלון',
          recipientEmail: '',
          recipientPhone: '0501234567',
          giverName: 'סבא וסבתא',
          personalMessage: '',
          deliveryMethod: 'whatsapp',
          status: 'sent',
          redeemUrl: 'https://www.petite-dreams.com/gift/redeem/PD-7KQ4M9XA',
          shareUrl: 'https://www.petite-dreams.com/api/g/PD-7KQ4M9XA',
          whatsappText: '🎁 מתנה קטנה, חלומות גדולים!\nקוד השובר: PD-7KQ4M9XA',
        },
      },
    })
  })
  await page.route('**/api/vouchers/*/qr.png', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.alloc(0) }))

  await page.goto('/gift')
  await page.getByRole('button', { name: 'יותר' }).click()
  await page.getByRole('button', { name: 'יותר' }).click()
  await expect(page.getByText('3 חבילות עיצוב', { exact: true }).first()).toBeVisible()

  await page.getByPlaceholder(/שם מקבל המתנה/).fill('ליאב, ניר ואלון')
  await page.getByPlaceholder(/שם מעניק המתנה/).fill('סבא וסבתא')
  // Email delivery needs a valid recipient email.
  await page.getByRole('button', { name: 'המשך לתשלום' }).click()
  await expect(page.getByText('יש למלא כתובת מייל תקינה של מקבל המתנה')).toBeVisible()

  await page.getByRole('button', { name: 'אשתף בעצמי בוואטסאפ' }).click()
  await page.getByPlaceholder(/טלפון מקבל המתנה/).fill('050-1234567')
  await expect(page.getByText('באהבה, סבא וסבתא ♡')).toBeVisible()
  await page.getByRole('button', { name: 'המשך לתשלום' }).click()

  // Order summary before paying
  await expect(page.getByRole('heading', { name: 'שובר מתנה' })).toBeVisible()
  await expect(page.getByText('3 חבילות עיצוב לחדרי הילדים').first()).toBeVisible()
  await page.getByRole('button', { name: 'לתשלום' }).click()
  await expect(page.getByText('יש לאשר את תנאי השימוש')).toBeVisible()
  expect(body).toBeNull()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'לתשלום' }).click()

  await expect(page.getByRole('heading', { name: 'השובר מוכן!' })).toBeVisible()
  await expect(page.getByText('PD-7KQ4M9XA').first()).toBeVisible()
  expect(body).toMatchObject({ packagesCount: 3, deliveryMethod: 'whatsapp', giverName: 'סבא וסבתא' })
  const wa = page.getByRole('link', { name: 'שיתוף בוואטסאפ' })
  await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/972501234567\?text=/)
})

test('redeeming a voucher starts the questionnaire with the voucher remembered', async ({ page }) => {
  await page.route('**/api/vouchers/PD-7KQ4M9XA', (route) =>
    route.fulfill({
      json: {
        valid: true,
        reason: null,
        code: 'PD-7KQ4M9XA',
        packagesCount: 3,
        packagesRemaining: 2,
        recipientNames: 'ליאב, ניר ואלון',
        giverName: 'סבא וסבתא',
        personalMessage: '',
      },
    }),
  )
  await page.route('**/api/vouchers/*/qr.png', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.alloc(0) }))
  await page.route('**/api/events', (route) => route.fulfill({ json: { ok: true } }))

  await page.goto('/gift/redeem/PD-7KQ4M9XA')
  await expect(page.getByText(/נותרו בו 2 חבילות עיצוב/)).toBeVisible()
  await page.getByRole('button', { name: 'לבחירת חבילות העיצוב' }).click()
  await expect(page).toHaveURL(/\/questionnaire$/)
  expect(await page.evaluate(() => sessionStorage.getItem('pd_redeem_voucher'))).toBe('PD-7KQ4M9XA')
})

test('an invalid voucher link explains why', async ({ page }) => {
  await page.route('**/api/vouchers/PD-NOPE2345', (route) => route.fulfill({ json: { valid: false, reason: 'used' } }))
  await page.goto('/gift/redeem/PD-NOPE2345')
  await expect(page.getByText('כל החבילות בשובר הזה כבר מומשו.')).toBeVisible()
})

test('checkout: coupon errors, coupon applied, and the order goes to the server', async ({ page }) => {
  await signIn(page)
  await page.route('**/api/events', (route) => route.fulfill({ json: { ok: true } }))
  await page.route('**/api/checkout/quote', async (route) => {
    const { couponCode } = route.request().postDataJSON() as { couponCode?: string }
    const base = {
      roomPrice: 660,
      subtotal: 660,
      voucherPackagesUsed: 0,
      voucher: null,
      voucherError: null,
    }
    if (couponCode === 'WRONG') {
      return route.fulfill({
        json: {
          ...base,
          lines: [{ index: 0, listPrice: 660, discountType: '', discountAmount: 0, price: 660, paidByVoucher: false }],
          discountTotal: 0,
          total: 660,
          couponApplied: false,
          couponSavings: 0,
          coupon: null,
          couponError: { code: 'not_found', message: 'קוד הקופון לא קיים' },
        },
      })
    }
    if (couponCode === 'MAYA15') {
      return route.fulfill({
        json: {
          ...base,
          lines: [{ index: 0, listPrice: 660, discountType: 'coupon', discountAmount: 99, price: 561, paidByVoucher: false }],
          discountTotal: 99,
          total: 561,
          couponApplied: true,
          couponSavings: 99,
          coupon: { code: 'MAYA15', discountPercent: 15 },
          couponError: null,
        },
      })
    }
    return route.fulfill({
      json: {
        ...base,
        lines: [{ index: 0, listPrice: 660, discountType: '', discountAmount: 0, price: 660, paidByVoucher: false }],
        discountTotal: 0,
        total: 660,
        couponApplied: false,
        couponSavings: 0,
        coupon: null,
        couponError: null,
      },
    })
  })
  let order: Record<string, unknown> | null = null
  await page.route('**/api/checkout/orders', async (route) => {
    order = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      json: {
        order: { id: 'o1', orderNumber: 1001, total: 561, discountTotal: 99, voucherPackagesUsed: 0 },
        items: [{ id: 'i1', roomId: 'r1', packageId: 'x' }],
      },
    })
  })

  const rooms = [
    {
      children: [
        { name: 'נועה', gender: 'girl', age: 4 },
        { name: 'אייר', gender: 'boy', age: 8 },
      ],
      designGender: 'unisex',
      ageChoice: { type: 'child', childIndex: 0 },
      theme: 'קרקס וקסם',
      colorPreference: '',
      wallDesignOption: 'paint',
    },
  ]
  await page.goto(`/checkout/x?rooms=${encodeURIComponent(JSON.stringify(rooms))}`)
  await expect(page.getByRole('heading', { name: 'תשלום מאובטח' })).toBeVisible()

  await page.getByRole('button', { name: 'יש לך קוד קופון?' }).click()
  await page.getByPlaceholder('קוד קופון').fill('wrong')
  await page.getByRole('button', { name: 'הפעלת הקוד' }).first().click()
  await expect(page.getByText('קוד הקופון לא קיים')).toBeVisible()

  await page.getByPlaceholder('קוד קופון').fill('maya15')
  await page.getByRole('button', { name: 'הפעלת הקוד' }).first().click()
  await expect(page.getByText('קוד MAYA15 הוחל — 15% הנחה')).toBeVisible()

  for (const box of await page.getByRole('checkbox').all()) await box.check()
  await page.getByRole('button', { name: 'השלימי רכישה' }).click()

  await expect.poll(() => order).not.toBeNull()
  expect(order).toMatchObject({
    couponCode: 'MAYA15',
    rooms: [
      {
        displayName: 'נועה ואייר',
        designGender: 'unisex',
        designAge: 4,
        ageGroup: '3-5',
        ageTrack: 'child',
        children: [
          { name: 'נועה', age: 4, gender: 'girl' },
          { name: 'אייר', age: 8, gender: 'boy' },
        ],
      },
    ],
  })
})

test('personal area: replaced packages move to the archive', async ({ page }) => {
  const roomId = '22222222-2222-4222-8222-222222222222'
  await signIn(page, {
    purchased_packages: ['flowers-dream-garden-girl-0-2-warm-natural', 'fairies-magic-forest-girl-3-5-warm-natural'],
    children: [
      { name: 'נועה', age: 2, packageId: 'flowers-dream-garden-girl-0-2-warm-natural', purchaseDate: '2025-01-10T10:00:00Z', gender: 'girl', theme: 'פרחים וגן חלומי', roomId, orderItemId: 'item-old', archivedAt: '2026-11-01T10:00:00Z', roomChildren: [{ name: 'נועה', age: 2, gender: 'girl' }] },
      { name: 'נועה', age: 3, packageId: 'fairies-magic-forest-girl-3-5-warm-natural', purchaseDate: '2026-11-01T10:00:00Z', gender: 'girl', theme: 'פיות ויער קסום', roomId, roomChildren: [{ name: 'נועה', age: 3, gender: 'girl' }] },
    ],
  })
  await page.goto('/account')
  await expect(page.getByRole('heading', { name: 'חבילת פיות ויער קסום' })).toBeVisible()
  await expect(page.getByText('חבילת פרחים וגן חלומי')).toHaveCount(0)

  await page.getByRole('button', { name: /ארכיון חבילות \(1\)/ }).click()
  await expect(page.getByRole('heading', { name: 'ארכיון החבילות' })).toBeVisible()
  await expect(page.getByText('חבילת פרחים וגן חלומי')).toBeVisible()
  await expect(page.getByText(/הועברה לארכיון ב/)).toBeVisible()

  // The archived package opens with the content exactly as it was bought.
  await page.route('https://mock.supabase.co/rest/v1/order_items**', (route) =>
    route.fulfill({
      json: {
        package_snapshot: {
          name: 'חבילת פרחים — כפי שנרכשה',
          shoppingCategories: [
            { category: 'טקסטיל', items: [{ name: 'כרית מקורית מהרכישה', link: 'https://he.aliexpress.com/item/1.html', image: '' }] },
          ],
        },
      },
    }),
  )
  await page.getByRole('button', { name: 'לצפייה' }).click()
  await expect(page).toHaveURL(/\?item=item-old/)
  await expect(page.getByText('כרית מקורית מהרכישה')).toBeVisible()
})

test('admin: dashboard, influencers, vouchers and links tabs load', async ({ page }) => {
  await signIn(page, { is_admin: true })
  const emptyStats = {
    from: '2026-10-24T00:00:00.000Z',
    to: '2026-11-23T00:00:00.000Z',
    granularity: 'day',
    sales: {
      totalPurchases: 12, packageOrders: 10, voucherOrders: 2, uniqueBuyers: 9, revenue: 7920, voucherRevenue: 1320,
      averageOrder: 660, packagesSold: 14, firstPackagePurchases: 8, upgradePurchases: 2, multiRoomOrders: 3,
      siblingDiscountOrders: 3, couponOrders: 4, voucherRedemptionOrders: 1, newPackageRevenue: 5280, upgradeRevenue: 1320,
      topPackages: [{ name: 'ספארי', count: 5 }], byTheme: [{ name: 'ספארי', count: 5 }], byColor: [{ name: 'חמים', count: 6 }],
    },
    children: {
      childrenEntered: 30, childrenPurchased: 17, byAge: { 2: 5, 4: 7 }, byAgeBucket: [{ name: '0–2', id: '0-2', count: 5 }],
      byGender: { boy: 14, girl: 16 }, themesByAgeGroup: { '0-2': [{ name: 'ספארי', count: 3 }] },
      themesByGender: { boy: [{ name: 'חלל', count: 4 }] }, purchasedByAgeBucket: [{ name: '0–2', id: '0-2', count: 4 }], crossAgeRooms: 1,
    },
    rooms: { roomsPurchased: 13, sharedRooms: 4, familiesMultipleRooms: 3, returningCustomers: 2, upgradesForExistingRooms: 2, archivedPackages: 2 },
    questionnaire: { started: 80, completed: 40, reachedCart: 25, purchased: 10, conversionRate: 12.5, dropOffSteps: [{ name: 'theme', count: 12 }] },
    series: [{ key: '2026-11-21', orders: 2, revenue: 1320, packages: 2 }, { key: '2026-11-22', orders: 1, revenue: 660, packages: 1 }],
    previous: null,
  }
  await page.route('**/api/admin/stats?**', (route) => route.fulfill({ json: emptyStats }))
  await page.route('**/api/admin/influencers', (route) =>
    route.fulfill({
      json: {
        influencers: [
          {
            id: 'inf1', name: 'מאיה', email: 'maya@example.com', phone: '', instagram: '@maya', notes: '', referral_slug: 'maya',
            referralUrl: 'https://www.petite-dreams.com/?ref=maya', commission_percent: 10, active: true, linkVisits: 40,
            coupons: [{ id: 'c1', code: 'MAYA15', influencer_id: 'inf1', discount_percent: 15, valid_from: null, valid_until: null, max_uses: null, active: true, description: '' }],
            stats: { orders: 5, paidOrders: 4, cancelledOrders: 1, sales: 2244, viaCoupon: 3, viaLink: 1, commission: 224.4, commissionPaid: 0, commissionDue: 224.4 },
          },
        ],
      },
    }),
  )
  await page.route('**/api/admin/coupons', (route) =>
    route.fulfill({ json: { coupons: [{ id: 'c1', code: 'MAYA15', influencer_id: 'inf1', influencer: { id: 'inf1', name: 'מאיה' }, discount_percent: 15, valid_from: null, valid_until: null, max_uses: null, active: true, description: '', uses: 4 }] } }),
  )
  await page.route('**/api/admin/vouchers', (route) =>
    route.fulfill({
      json: {
        vouchers: [
          {
            id: 'v1', code: 'PD-7KQ4M9XA', packagesCount: 3, packagesRedeemed: 1, packagesRemaining: 2, recipientNames: 'ליאב, ניר ואלון',
            recipientEmail: 'family@example.com', recipientPhone: '', giverName: 'סבא וסבתא', personalMessage: '', deliveryMethod: 'email',
            status: 'partially_redeemed', redeemUrl: 'https://www.petite-dreams.com/gift/redeem/PD-7KQ4M9XA', buyerName: 'סבתא',
            buyerEmail: 'grandma@example.com', pricePaid: 1716, createdAt: '2026-11-20T10:00:00Z', sentAt: '2026-11-20T10:00:00Z',
            redemptions: [{ orderId: 'o1', packagesUsed: 1, createdAt: '2026-11-21T10:00:00Z' }],
          },
        ],
      },
    }),
  )
  await page.route('**/api/admin/links', (route) =>
    route.fulfill({
      json: {
        links: [
          { id: 'l1', package_id: 'p1', package_name: 'ספארי', category: 'טקסטיל', item_name: 'כרית נוי 1', url: 'https://he.aliexpress.com/item/1.html', status: 'broken', http_status: 404, problem: 'השרת החזיר שגיאה 404', first_failed_at: '2026-11-15T05:00:00Z', last_checked_at: '2026-11-22T05:00:00Z', handled_at: null },
          { id: 'l2', package_id: 'p1', package_name: 'ספארי', category: 'טקסטיל', item_name: 'שטיח', url: 'https://he.aliexpress.com/item/2.html', status: 'ok', http_status: 200, problem: '', first_failed_at: null, last_checked_at: '2026-11-22T05:00:00Z', handled_at: null },
        ],
        counts: { ok: 1, broken: 1, unverified: 0, total: 2 },
        lastRun: { started_at: '2026-11-22T05:00:00Z', finished_at: '2026-11-22T05:01:00Z', total_links: 2, checked_links: 2, ok_count: 1, broken_count: 1, unverified_count: 0, report_sent_at: null },
        activeRun: null,
      },
    }),
  )

  await page.goto('/admin')
  await expect(page.getByText('לקוחות רוכשים ייחודיים')).toBeVisible()
  await expect(page.getByText('₪7,920').first()).toBeVisible()
  await expect(page.getByText('נושא').first()).toBeVisible()

  await page.getByRole('button', { name: 'משפיעניות וקופונים' }).click()
  await expect(page.getByRole('heading', { name: 'מאיה' })).toBeVisible()
  await expect(page.getByText('MAYA15').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'סימון עמלה כשולמה' })).toBeVisible()

  await page.getByRole('button', { name: 'שוברי מתנה' }).click()
  await expect(page.getByText('PD-7KQ4M9XA')).toBeVisible()
  await expect(page.getByRole('article').getByText('מומש חלקית')).toBeVisible()

  await page.getByRole('button', { name: 'קישורים שבורים' }).click()
  await expect(page.getByText('כרית נוי 1')).toBeVisible()
  await expect(page.getByText('שטיח')).toHaveCount(0)
  await page.getByRole('button', { name: 'החלפת קישור' }).click()
  await expect(page.getByPlaceholder('https://...')).toBeVisible()
})

async function openRoomRedesign(page: Page, ages: [number, number]) {
  const roomId = '33333333-3333-4333-8333-333333333333'
  await signIn(page, {
    purchased_packages: ['flowers-dream-garden-girl-0-2-warm-natural'],
    children: [
      {
        name: 'נועה ואייר',
        age: ages[0],
        packageId: 'flowers-dream-garden-girl-0-2-warm-natural',
        purchaseDate: new Date().toISOString(),
        gender: 'unisex',
        roomId,
        roomChildren: [
          { name: 'נועה', age: ages[0], gender: 'girl' },
          { name: 'אייר', age: ages[1], gender: 'boy' },
        ],
      },
    ],
  })
  await page.route('**/api/events', (route) => route.fulfill({ json: { ok: true } }))
  await page.goto(`/questionnaire?roomId=${roomId}`)
  await expect(page.getByText(/עיצוב חדש לחדר של נועה ואייר/)).toBeVisible()
}

test('shared room, neighbouring ages: family picks whose age the design follows', async ({ page }) => {
  await openRoomRedesign(page, [2, 4])
  // rooms, 2 children, design gender, design age, theme, color, wall
  await expect(page.getByText('01 / 08')).toBeVisible()
})

test('shared room, ages far apart: goes straight to cross-age themes', async ({ page }) => {
  await openRoomRedesign(page, [2, 7])
  // rooms, 2 children, design gender, theme, color, wall — no "whose age" step
  await expect(page.getByText('01 / 07')).toBeVisible()
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: 'המשך' }).click()
  await page.getByRole('button', { name: /חדר ניטרלי/ }).click()
  await page.getByRole('button', { name: 'המשך' }).click()
  await expect(page.getByRole('heading', { name: 'נושאים חוצי גילאים לחדר של נועה ואייר' })).toBeVisible()
  await expect(page.getByText(/בסוף תתקבל חבילת עיצוב אחת לחדר המשותף/)).toBeVisible()
})

test('application guides edited in admin open as their own page', async ({ page }) => {
  await signIn(page, {})
  await page.route('https://mock.supabase.co/rest/v1/app_settings**', (route) => {
    if (!route.request().url().includes('application_guides')) return route.fulfill({ json: null })
    return route.fulfill({
      json: {
        value: [
          { id: 'checklist', title: 'צ׳ק ליסט לביצוע', subtitle: 'לפני שמתחילים', summary: 'תקציר', body: 'פסקה ראשונה.\n\n- למדוד את הקיר\n- לקנות צבע' },
          { id: 'corners', title: 'פינות', subtitle: '', summary: '', body: '' },
        ],
      },
    })
  })
  await page.goto('/account')
  await page.getByRole('button', { name: 'לקריאת המדריך' }).first().click()
  await expect(page).toHaveURL(/\/guides\/checklist$/)
  await expect(page.getByRole('heading', { name: 'צ׳ק ליסט לביצוע' })).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'למדוד את הקיר' })).toBeVisible()
})
