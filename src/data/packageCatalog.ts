export type PackageAgeGroupId = '0-2' | '3-5' | '6-10'
export type CatalogGender = 'boy' | 'girl' | 'unisex'

export interface CatalogTheme {
  id: string
  name: string
  /** Existing package template id (e.g. animals → ספארי) */
  legacyBaseId?: string
}

export interface PackageAgeGroup {
  id: PackageAgeGroupId
  label: string
  range: [number, number]
}

export const PACKAGE_AGE_GROUPS: PackageAgeGroup[] = [
  { id: '0-2', label: 'גילאי 0-2', range: [0, 2] },
  { id: '3-5', label: 'גילאי 3-5', range: [3, 5] },
  { id: '6-10', label: 'גילאי 6-10', range: [6, 10] },
]

export const CATALOG_GENDERS: { id: CatalogGender; label: string }[] = [
  { id: 'boy', label: 'בנים' },
  { id: 'girl', label: 'בנות' },
  { id: 'unisex', label: 'ניטרלי' },
]


/** Boys' room themes by age — from product hierarchy. */
export const BOY_THEME_CATALOG: Record<PackageAgeGroupId, CatalogTheme[]> = {
  '0-2': [
    { id: 'safari', name: 'ספארי', legacyBaseId: 'animals' },
    { id: 'adventures', name: 'הרפתקאות', legacyBaseId: 'adventures' },
    { id: 'sea-ships', name: 'ים וספינות', legacyBaseId: 'sea-ships' },
    { id: 'transport', name: 'כלי תחבורה', legacyBaseId: 'transport' },
  ],
  '3-5': [
    { id: 'junior-superheroes', name: "גיבורי על ג'וניור" },
    { id: 'dinosaurs', name: 'דינוזאורים' },
    { id: 'space', name: 'חלל' },
    { id: 'nature-explore', name: 'טבע וחקר' },
  ],
  '6-10': [
    { id: 'gamers', name: 'גיימרים' },
    { id: 'superheroes', name: 'גיבורי על' },
    { id: 'science', name: 'מדע וחקר' },
    { id: 'sports', name: 'כדורגל וספורט' },
  ],
}

/** Girls' room themes by age — from product hierarchy. */
export const GIRL_THEME_CATALOG: Record<PackageAgeGroupId, CatalogTheme[]> = {
  '0-2': [
    { id: 'flowers-dream-garden', name: 'פרחים וגן חלומי' },
    { id: 'magical-forest-animals', name: 'חיות יער קסומות' },
    { id: 'moon-stars-sky', name: 'ירח, כוכבים ושמיים' },
    { id: 'sea-shells-treasures', name: 'ים, צדפים ואוצרות קטנים' },
  ],
  '3-5': [
    { id: 'fairies-magic-forest', name: 'פיות ויער קסום' },
    { id: 'fairytales-princesses', name: 'אגדות ונסיכות' },
    { id: 'unicorn-rainbow', name: 'חד קרן וקשת בענן' },
    { id: 'butterflies-birds', name: 'פרפרים וציפורים' },
  ],
  '6-10': [
    { id: 'floral-boho', name: 'בוהו פרחוני וסטייל טבעי' },
    { id: 'fashion-style', name: 'אופנה וסטייל' },
    { id: 'music-dance-stage', name: 'מוזיקה, ריקוד ובמה' },
    { id: 'sea-surfing-freedom', name: 'ים, גלישה וחופש' },
  ],
}

/** Unisex room themes by age — from product hierarchy. */
export const UNISEX_THEME_CATALOG: Record<PackageAgeGroupId, CatalogTheme[]> = {
  '0-2': [
    { id: 'nordic-forest', name: 'יער נורדי' },
    { id: 'clouds-dreams', name: 'עננים וחלומות' },
    { id: 'pastel-safari', name: 'ספארי פסטל' },
    { id: 'beaches-shells', name: 'חופים וצדפים' },
  ],
  '3-5': [
    { id: 'camping-nature', name: 'קמפינג וטבע' },
    { id: 'underwater', name: 'מתחת למים' },
    { id: 'sky-stars', name: 'שמיים וכוכבים' },
    { id: 'circus-magic', name: 'קרקס וקסם' },
  ],
  '6-10': [
    { id: 'journeys-discovery', name: 'מסעות וגילוי' },
    { id: 'nature-adventure', name: 'הרפתקה בטבע' },
    { id: 'music-world', name: 'עולם המוזיקה' },
    { id: 'creation-inspiration', name: 'יצירה והשראה' },
  ],
}

export const THEME_CATALOG: Record<CatalogGender, Record<PackageAgeGroupId, CatalogTheme[]>> = {
  boy: BOY_THEME_CATALOG,
  girl: GIRL_THEME_CATALOG,
  unisex: UNISEX_THEME_CATALOG,
}

export function getCatalogThemes(gender: CatalogGender, ageId: PackageAgeGroupId): CatalogTheme[] {
  return THEME_CATALOG[gender][ageId]
}

export function findCatalogTheme(
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  themeId: string,
): CatalogTheme | undefined {
  return getCatalogThemes(gender, ageId).find((theme) => theme.id === themeId)
}

export function getAgeGroup(ageId: PackageAgeGroupId): PackageAgeGroup {
  return PACKAGE_AGE_GROUPS.find((group) => group.id === ageId)!
}

export function getAgeGroupIdForAge(age: number): PackageAgeGroupId {
  if (age <= 2) return '0-2'
  if (age <= 5) return '3-5'
  return '6-10'
}

export function getQuestionnaireThemesForChild(
  gender: CatalogGender,
  age: number,
): CatalogTheme[] {
  return getCatalogThemes(gender, getAgeGroupIdForAge(age))
}

export function findCatalogThemeByName(
  gender: CatalogGender,
  age: number,
  themeName: string,
): CatalogTheme | undefined {
  const ageId = getAgeGroupIdForAge(age)
  return getCatalogThemes(gender, ageId).find((theme) => theme.name === themeName)
}

export function allCatalogThemeNames(): string[] {
  const names = new Set<string>()
  for (const gender of CATALOG_GENDERS) {
    for (const ageGroup of PACKAGE_AGE_GROUPS) {
      for (const theme of THEME_CATALOG[gender.id][ageGroup.id]) {
        names.add(theme.name)
      }
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'he'))
}
