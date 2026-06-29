import type { ColorScale } from '../data/colorScales'
import type { ThemePackage } from '../data/themePackages'

export const BASE_PACKAGE_IDS = ['animals', 'adventures', 'sea-ships', 'transport'] as const

export const PACKAGE_GENDERS = ['boy', 'girl'] as const
export type PackageGender = (typeof PACKAGE_GENDERS)[number]

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

export function expectedVariantCount(colorScaleCount: number): number {
  return BASE_PACKAGE_IDS.length * PACKAGE_GENDERS.length * colorScaleCount
}

export function hasVariantPackages(packages: ThemePackage[]): boolean {
  return packages.some((pkg) => parseVariantId(pkg.id) !== null)
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
