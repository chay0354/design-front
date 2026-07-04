import type { ColorScale } from './colorScales'
import type { CatalogGender, PackageAgeGroupId } from './packageCatalog'
import { findCatalogThemeByName, getAgeGroupIdForAge } from './packageCatalog'

export type ThemeCatalogKey = `${CatalogGender}:${PackageAgeGroupId}:${string}`

export function themeCatalogKey(
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  themeId: string,
): ThemeCatalogKey {
  return `${gender}:${ageId}:${themeId}`
}

/** Per-theme allowed color scale ids — gender:age:themeId → scale ids (in display order). */
export const THEME_COLOR_SCALE_MAP: Partial<Record<ThemeCatalogKey, string[]>> = {
  // Boys 0-2
  'boy:0-2:safari': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'boy:0-2:adventures': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'boy:0-2:sea-ships': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'boy:0-2:transport': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  // Boys 3-5
  'boy:3-5:junior-superheroes': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'boy:3-5:dinosaurs': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'boy:3-5:space': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'boy:3-5:nature-explore': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  // Boys 6-10
  'boy:6-10:gamers': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'boy:6-10:superheroes': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'boy:6-10:science': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'boy:6-10:sports': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  // Unisex 0-2
  'unisex:0-2:nordic-forest': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'unisex:0-2:clouds-dreams': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'unisex:0-2:pastel-safari': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'unisex:0-2:beaches-shells': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  // Unisex 3-5
  'unisex:3-5:camping-nature': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'unisex:3-5:underwater': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'unisex:3-5:sky-stars': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'unisex:3-5:circus-magic': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  // Unisex 6-10
  'unisex:6-10:journeys-discovery': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'unisex:6-10:nature-adventure': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'unisex:6-10:music-world': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'unisex:6-10:creation-inspiration': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  // Girls 0-2
  'girl:0-2:flowers-dream-garden': ['warm-natural', 'soft-pinks', 'happy-colorful', 'elegant-grays'],
  'girl:0-2:magical-forest-animals': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'girl:0-2:moon-stars-sky': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  'girl:0-2:sea-shells-treasures': ['warm-natural', 'calming-blues', 'happy-colorful', 'elegant-grays'],
  // Girls 3-5
  'girl:3-5:fairies-magic-forest': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'girl:3-5:fairytales-princesses': ['warm-natural', 'soft-pinks', 'happy-colorful', 'elegant-grays'],
  'girl:3-5:unicorn-rainbow': ['warm-natural', 'soft-pinks', 'happy-colorful', 'elegant-grays'],
  'girl:3-5:butterflies-birds': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  // Girls 6-10
  'girl:6-10:floral-boho': ['warm-natural', 'soft-pinks', 'happy-colorful', 'elegant-grays'],
  'girl:6-10:fashion-style': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'girl:6-10:music-dance-stage': ['warm-natural', 'fresh-greens', 'happy-colorful', 'elegant-grays'],
  'girl:6-10:sea-surfing-freedom': ['warm-natural', 'sunny-yellows', 'happy-colorful', 'elegant-grays'],
}

export function getThemeColorScaleIds(
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  themeId: string,
): string[] | undefined {
  return THEME_COLOR_SCALE_MAP[themeCatalogKey(gender, ageId, themeId)]
}

export function getThemeColorScaleIdsForChild(
  gender: CatalogGender,
  age: number,
  themeName: string,
): string[] | undefined {
  const theme = findCatalogThemeByName(gender, age, themeName)
  if (!theme) return undefined
  return getThemeColorScaleIds(gender, getAgeGroupIdForAge(age), theme.id)
}

export function filterColorScalesForTheme(
  allScales: ColorScale[],
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  themeId: string,
): ColorScale[] {
  const allowedIds = getThemeColorScaleIds(gender, ageId, themeId)
  if (!allowedIds) return allScales

  const byId = new Map(allScales.map((scale) => [scale.id, scale]))
  return allowedIds
    .map((id) => byId.get(id))
    .filter((scale): scale is ColorScale => scale !== undefined)
}

export function filterColorScalesForChild(
  allScales: ColorScale[],
  gender: CatalogGender,
  age: number,
  themeName: string,
): ColorScale[] {
  const theme = findCatalogThemeByName(gender, age, themeName)
  if (!theme) return allScales
  return filterColorScalesForTheme(allScales, gender, getAgeGroupIdForAge(age), theme.id)
}
