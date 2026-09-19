import type { CatalogGender, PackageAgeGroupId } from './packageCatalog'
import { findCatalogThemeByName, getAgeGroupIdForAge } from './packageCatalog'
import catalog from './designPackageImages.json'
import { catalogPathForPackageId, parseCatalogVariantId, parseVariantId } from '../utils/packageVariants'

export interface DesignPackageImages {
  teaser: string
  hero: string
  gallery: string[]
}

const EMPTY: DesignPackageImages = { teaser: '', hero: '', gallery: [] }

type Manifest = Record<string, { teaser?: string; hero?: string; gallery?: string[] }>

const MANIFEST = catalog as Manifest

function key(
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  themeId: string,
  colorScaleId: string,
) {
  return `${gender}:${ageId}:${themeId}:${colorScaleId}`
}

function readBucket(id: string): DesignPackageImages {
  const row = MANIFEST[id]
  if (!row) return { ...EMPTY, gallery: [] }
  return {
    teaser: row.teaser ?? '',
    hero: row.hero ?? '',
    gallery: row.gallery ?? [],
  }
}

function mergeImages(primary: DesignPackageImages, fallback: DesignPackageImages): DesignPackageImages {
  const gallery = primary.gallery.length > 0 ? primary.gallery : fallback.gallery
  const teaser = primary.teaser || fallback.teaser
  const hero = primary.hero || fallback.hero || teaser
  return { teaser, hero, gallery }
}

export function resolveDesignPackageImages(
  gender: CatalogGender,
  ageId: PackageAgeGroupId,
  themeId: string,
  colorScaleId?: string,
): DesignPackageImages {
  const shared = readBucket(key(gender, ageId, themeId, 'shared'))
  if (!colorScaleId) return mergeImages(shared, EMPTY)
  return mergeImages(readBucket(key(gender, ageId, themeId, colorScaleId)), shared)
}

export function resolveDesignPackageImagesForSelection(
  gender: CatalogGender,
  age: number,
  themeName?: string,
  colorScaleId?: string,
): DesignPackageImages {
  if (!themeName) return { ...EMPTY, gallery: [] }
  const ageId = getAgeGroupIdForAge(age)
  const theme = findCatalogThemeByName(gender, age, themeName)
  if (!theme) return { ...EMPTY, gallery: [] }
  return resolveDesignPackageImages(gender, ageId, theme.id, colorScaleId)
}

export function resolveDesignPackageImagesForPackage(
  packageId: string,
  fallback?: { gender?: CatalogGender; age?: number; themeName?: string; colorScaleId?: string },
): DesignPackageImages {
  const catalog = parseCatalogVariantId(packageId)
  if (catalog) {
    return resolveDesignPackageImages(
      catalog.gender,
      catalog.ageId,
      catalog.themeId,
      catalog.colorScaleId,
    )
  }

  const path = catalogPathForPackageId(packageId)
  if (path) {
    const legacy = parseCatalogVariantId(packageId) ? null : parseVariantId(packageId)
    return resolveDesignPackageImages(
      path.gender,
      path.ageId,
      path.themeId,
      legacy?.colorScaleId ?? fallback?.colorScaleId,
    )
  }

  if (fallback?.gender && fallback.age && fallback.themeName) {
    return resolveDesignPackageImagesForSelection(
      fallback.gender,
      fallback.age,
      fallback.themeName,
      fallback.colorScaleId,
    )
  }

  return { ...EMPTY, gallery: [] }
}

export function hasDesignPackageImages(images: DesignPackageImages): boolean {
  return Boolean(images.teaser || images.hero || images.gallery.length)
}
