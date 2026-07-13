import type { ColorScale } from '../data/colorScales'
import type { ThemePackage } from '../data/themePackages'
import type { CatalogGender, CatalogTheme, PackageAgeGroupId } from '../data/packageCatalog'
import { BOY_THEME_CATALOG, getAgeGroup, getAgeGroupIdForAge, findCatalogThemeByName, findCatalogTheme, THEME_CATALOG } from '../data/packageCatalog'
import { THEME_COLOR_SCALE_MAP, themeCatalogKey } from '../data/themeColorScales'

export const BASE_PACKAGE_IDS = ['animals', 'adventures', 'sea-ships', 'transport'] as const

export const PACKAGE_GENDERS = ['boy', 'girl'] as const
export type PackageGender = (typeof PACKAGE_GENDERS)[number]

export const CATALOG_GENDER_IDS = ['boy', 'girl', 'unisex'] as const

const CATALOG_AGE_IDS = ['0-2', '3-5', '6-10'] as const

export const THEME_TO_BASE_ID: Record<string, string> = {
  חיות: 'animals',
  הרפתקאות: 'adventures',
  'ים וספינות': 'sea-ships',
  'כלי תחבורה': 'transport',
}

export const BASE_ID_TO_THEME: Record<string, string> = Object.fromEntries(
  Object.entries(THEME_TO_BASE_ID).map(([theme, id]) => [id, theme]),
)

const GENDER_LABELS: Record<PackageGender, string> = {
  boy: 'בנים',
  girl: 'בנות',
}

export function isBasePackageId(id: string): boolean {
  return (BASE_PACKAGE_IDS as readonly string[]).includes(id)
}

export function buildVariantId(
  baseId: string,
  gender: PackageGender,
  colorScaleId: string,
): string {
  return `${baseId}-${gender}-${colorScaleId}`
}

export function parseVariantId(
  id: string,
): { baseId: string; gender: PackageGender; colorScaleId: string } | null {
  for (const baseId of BASE_PACKAGE_IDS) {
    if (!id.startsWith(`${baseId}-`)) continue
    const rest = id.slice(baseId.length + 1)
    for (const gender of PACKAGE_GENDERS) {
      if (!rest.startsWith(`${gender}-`)) continue
      const colorScaleId = rest.slice(gender.length + 1)
      if (colorScaleId) return { baseId, gender, colorScaleId }
    }
  }
  return null
}

export function getBasePackageId(pkg: ThemePackage): string {
  return parseVariantId(pkg.id)?.baseId ?? pkg.id
}

export function buildVariantPackage(
  base: ThemePackage,
  gender: PackageGender,
  scale: ColorScale,
): ThemePackage {
  return {
    ...structuredClone(base),
    id: buildVariantId(base.id, gender, scale.id),
    gender,
    name: `חבילת ${base.theme} — ${GENDER_LABELS[gender]} — ${scale.name}`,
    colorPalette: scale.colors.map((color) => color.hex),
    questionnaireTheme: base.questionnaireTheme,
  }
}

export function expandBasePackagesToVariants(
  bases: ThemePackage[],
  scales: ColorScale[],
): ThemePackage[] {
  const baseOnly = bases.filter((pkg) => isBasePackageId(pkg.id))
  const variants: ThemePackage[] = []

  for (const base of baseOnly) {
    for (const gender of PACKAGE_GENDERS) {
      for (const scale of scales) {
        variants.push(buildVariantPackage(base, gender, scale))
      }
    }
  }

  return variants
}

export function mergeVariantsWithExisting(
  bases: ThemePackage[],
  existing: ThemePackage[],
  scales: ColorScale[],
): ThemePackage[] {
  const generated = expandBasePackagesToVariants(bases, scales)
  const byId = new Map(existing.map((pkg) => [pkg.id, pkg]))
  return generated.map((variant) => byId.get(variant.id) ?? variant)
}

export function resolvePackageVariant(
  packages: ThemePackage[],
  basePackages: ThemePackage[],
  scales: ColorScale[],
  baseId: string,
  gender: PackageGender,
  colorScaleId: string,
): ThemePackage {
  const variantId = buildVariantId(baseId, gender, colorScaleId)
  const existing = packages.find((pkg) => pkg.id === variantId)
  if (existing) return existing

  const base =
    packages.find((pkg) => pkg.id === baseId) ??
    basePackages.find((pkg) => pkg.id === baseId)
  const scale = scales.find((s) => s.id === colorScaleId)
  if (!base || !scale) {
    throw new Error(`Missing base package or color scale for ${variantId}`)
  }
  return buildVariantPackage(base, gender, scale)
}

export function buildCatalogVariantId(
  themeId: string,
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  colorScaleId: string,
): string {
  return `${themeId}-${gender}-${ageId}-${colorScaleId}`
}

export function parseCatalogVariantId(id: string): {
  themeId: string
  gender: CatalogGender
  ageId: PackageAgeGroupId
  colorScaleId: string
} | null {
  for (const gender of CATALOG_GENDER_IDS) {
    for (const ageId of CATALOG_AGE_IDS) {
      const marker = `-${gender}-${ageId}-`
      const idx = id.indexOf(marker)
      if (idx <= 0) continue
      const themeId = id.slice(0, idx)
      const colorScaleId = id.slice(idx + marker.length)
      if (themeId && colorScaleId) {
        return { themeId, gender, ageId, colorScaleId }
      }
    }
  }
  return null
}

export function resolveLegacyVariantId(
  theme: CatalogTheme,
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  colorScaleId: string,
): string | null {
  if (!theme.legacyBaseId || ageId !== '0-2' || gender !== 'boy') return null
  return buildVariantId(theme.legacyBaseId, gender, colorScaleId)
}

export function catalogPathForPackageId(id: string): {
  gender: CatalogGender
  ageId: PackageAgeGroupId
  themeId: string
} | null {
  const catalog = parseCatalogVariantId(id)
  if (catalog) {
    return {
      gender: catalog.gender,
      ageId: catalog.ageId,
      themeId: catalog.themeId,
    }
  }

  const legacy = parseVariantId(id)
  if (legacy?.gender === 'boy') {
    const theme = BOY_THEME_CATALOG['0-2'].find((entry) => entry.legacyBaseId === legacy.baseId)
    if (theme) {
      return { gender: 'boy', ageId: '0-2', themeId: theme.id }
    }
  }

  return null
}

export function resolveCatalogVariant(
  packages: ThemePackage[],
  basePackages: ThemePackage[],
  scales: ColorScale[],
  theme: CatalogTheme,
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  colorScaleId: string,
): ThemePackage {
  const catalogId = buildCatalogVariantId(theme.id, gender, ageId, colorScaleId)
  const catalogExisting = packages.find((pkg) => pkg.id === catalogId)
  if (catalogExisting) return catalogExisting

  const legacyId = resolveLegacyVariantId(theme, gender, ageId, colorScaleId)
  if (legacyId) {
    const legacyExisting = packages.find((pkg) => pkg.id === legacyId)
    if (legacyExisting) return legacyExisting
  }

  const scale = scales.find((entry) => entry.id === colorScaleId)
  if (!scale) throw new Error(`Missing color scale ${colorScaleId}`)

  const base =
    (theme.legacyBaseId
      ? basePackages.find((pkg) => pkg.id === theme.legacyBaseId) ??
        packages.find((pkg) => pkg.id === theme.legacyBaseId)
      : undefined) ?? basePackages.find((pkg) => isBasePackageId(pkg.id))

  if (!base) throw new Error(`Missing base template for ${theme.name}`)

  const ageGroup = getAgeGroup(ageId)
  const genderLabel =
    gender === 'boy' ? 'בנים' : gender === 'girl' ? 'בנות' : 'ניטרלי'

  return {
    ...structuredClone(base),
    id: catalogId,
    gender,
    ageRange: ageGroup.range,
    theme: theme.name,
    questionnaireTheme: theme.name,
    name: `חבילת ${theme.name} — ${genderLabel} — ${ageGroup.label} — ${scale.name}`,
    colorPalette: scale.colors.map((color) => color.hex),
    heroImage: '',
    galleryImages: [],
    shoppingCategories: theme.legacyBaseId ? structuredClone(base.shoppingCategories) : [],
  }
}

export function resolvePackageById(
  id: string,
  packages: ThemePackage[],
  basePackages: ThemePackage[],
  scales: ColorScale[],
): ThemePackage | undefined {
  const direct = packages.find((pkg) => pkg.id === id)
  if (direct) return direct

  const catalog = parseCatalogVariantId(id)
  if (catalog) {
    const theme = findCatalogTheme(catalog.gender, catalog.ageId, catalog.themeId)
    if (theme) {
      return resolveCatalogVariant(
        packages,
        basePackages,
        scales,
        theme,
        catalog.gender,
        catalog.ageId,
        catalog.colorScaleId,
      )
    }
  }

  const legacy = parseVariantId(id)
  if (legacy) {
    const legacyExisting = packages.find((pkg) => pkg.id === id)
    if (legacyExisting) return legacyExisting

    const base = basePackages.find((pkg) => pkg.id === legacy.baseId)
    const scale = scales.find((entry) => entry.id === legacy.colorScaleId)
    if (base && scale) {
      return buildVariantPackage(base, legacy.gender, scale)
    }
  }

  if (isBasePackageId(id)) {
    return packages.find((pkg) => pkg.id.startsWith(`${id}-`))
  }

  return undefined
}

export function packageMatchesCatalogSelection(
  pkg: ThemePackage,
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  theme: CatalogTheme,
  colorScaleId?: string,
): boolean {
  const catalog = parseCatalogVariantId(pkg.id)
  if (catalog) {
    return (
      catalog.themeId === theme.id &&
      catalog.gender === gender &&
      catalog.ageId === ageId &&
      (!colorScaleId || catalog.colorScaleId === colorScaleId)
    )
  }

  const legacy = parseVariantId(pkg.id)
  if (legacy && theme.legacyBaseId && ageId === '0-2' && gender === 'boy') {
    return (
      legacy.baseId === theme.legacyBaseId &&
      legacy.gender === gender &&
      (!colorScaleId || legacy.colorScaleId === colorScaleId)
    )
  }

  const themeMatches = Boolean(
    pkg.questionnaireTheme === theme.name ||
      pkg.theme === theme.name ||
      (theme.legacyBaseId &&
        (pkg.questionnaireTheme === BASE_ID_TO_THEME[theme.legacyBaseId] ||
          getBasePackageId(pkg) === theme.legacyBaseId)),
  )

  return themeMatches && pkg.gender === gender
}

export function resolveMatchingPackage(
  packages: ThemePackage[],
  basePackages: ThemePackage[],
  scales: ColorScale[],
  gender: CatalogGender,
  age: number,
  themeName?: string,
  colorPreference?: string,
): ThemePackage | undefined {
  const ageId = getAgeGroupIdForAge(age)
  const scale = colorPreference
    ? scales.find((entry) =>
        entry.questionnaireKeywords.some((keyword) => colorPreference.includes(keyword)),
      ) ?? scales[0]
    : scales[0]

  const variantPackages = packages.filter(
    (pkg) => parseCatalogVariantId(pkg.id) !== null || parseVariantId(pkg.id) !== null,
  )

  let candidates = variantPackages

  if (themeName) {
    const catalogTheme = findCatalogThemeByName(gender, age, themeName)
    if (catalogTheme) {
      const themed = candidates.filter((pkg) =>
        packageMatchesCatalogSelection(pkg, gender, ageId, catalogTheme, scale?.id),
      )
      if (themed.length > 0) {
        candidates = themed
      } else {
        return resolveCatalogVariant(
          packages,
          basePackages,
          scales,
          catalogTheme,
          gender,
          ageId,
          scale.id,
        )
      }
    } else {
      const themeMatch = candidates.filter(
        (pkg) => pkg.questionnaireTheme === themeName || pkg.theme === themeName,
      )
      if (themeMatch.length > 0) candidates = themeMatch
    }
  }

  if (gender !== 'unisex') {
    const genderMatch = candidates.filter((pkg) => pkg.gender === gender)
    if (genderMatch.length > 0) candidates = genderMatch
  }

  if (scale) {
    const colorMatch = candidates.filter((pkg) => {
      const catalog = parseCatalogVariantId(pkg.id)
      if (catalog?.colorScaleId === scale.id) return true
      const legacy = parseVariantId(pkg.id)
      if (legacy?.colorScaleId === scale.id) return true
      return pkg.id.endsWith(`-${scale.id}`)
    })
    if (colorMatch.length > 0) candidates = colorMatch
  }

  const ageMatch = candidates.filter(
    (pkg) => age >= pkg.ageRange[0] && age <= pkg.ageRange[1],
  )
  if (ageMatch.length > 0) return ageMatch[0]
  if (candidates.length > 0) return candidates[0]

  if (themeName) {
    const catalogTheme = findCatalogThemeByName(gender, age, themeName)
    if (catalogTheme && scale) {
      return resolveCatalogVariant(
        packages,
        basePackages,
        scales,
        catalogTheme,
        gender,
        ageId,
        scale.id,
      )
    }
  }

  return undefined
}

export function expectedVariantCount(colorScaleCount: number): number {
  const mappedKeys = new Set(Object.keys(THEME_COLOR_SCALE_MAP))
  let count = 0

  for (const scaleIds of Object.values(THEME_COLOR_SCALE_MAP)) {
    if (scaleIds) count += scaleIds.length
  }

  for (const gender of CATALOG_GENDER_IDS) {
    for (const ageId of CATALOG_AGE_IDS) {
      for (const theme of THEME_CATALOG[gender][ageId]) {
        if (!mappedKeys.has(themeCatalogKey(gender, ageId, theme.id))) {
          count += colorScaleCount
        }
      }
    }
  }

  return count
}

export function hasVariantPackages(packages: ThemePackage[]): boolean {
  return packages.some(
    (pkg) => parseCatalogVariantId(pkg.id) !== null || parseVariantId(pkg.id) !== null,
  )
}

const DEFAULT_PACKAGE_IMAGE = /^\/assets\/packages\/[^/]+-(hero|wall|detail)\.svg$/

export function isCustomImageUrl(url: string): boolean {
  return Boolean(url && !DEFAULT_PACKAGE_IMAGE.test(url))
}

export function filterGalleryUrls(urls: string[]): string[] {
  return urls.filter(isCustomImageUrl)
}

export function hasCustomGallery(pkg: ThemePackage): boolean {
  return isCustomImageUrl(pkg.heroImage) || pkg.galleryImages.some(isCustomImageUrl)
}

/** Share design photos across gender/color variants of the same theme until each is customized. */
export function resolvePackageGalleryImages(
  pkg: ThemePackage,
  allPackages: ThemePackage[],
): Pick<ThemePackage, 'heroImage' | 'galleryImages'> {
  if (hasCustomGallery(pkg)) {
    return {
      heroImage: isCustomImageUrl(pkg.heroImage) ? pkg.heroImage : '',
      galleryImages: filterGalleryUrls(pkg.galleryImages),
    }
  }

  const baseId = getBasePackageId(pkg)
  const themeSource = allPackages.find(
    (candidate) => getBasePackageId(candidate) === baseId && hasCustomGallery(candidate),
  )
  if (themeSource) {
    return {
      heroImage: isCustomImageUrl(themeSource.heroImage) ? themeSource.heroImage : '',
      galleryImages: filterGalleryUrls(themeSource.galleryImages),
    }
  }

  return { heroImage: '', galleryImages: [] }
}
