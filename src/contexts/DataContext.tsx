import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { themePackages as staticPackages, type ThemePackage } from '../data/themePackages'
import { colorScales as staticColorScales, type ColorScale } from '../data/colorScales'
import {
  BASE_PACKAGE_IDS,
  expandBasePackagesToVariants,
  getBasePackageId,
  hasCustomGallery,
  hasVariantPackages,
  isBasePackageId,
  mergeVariantsWithExisting,
  resolveMatchingPackage,
  resolvePackageGalleryImages,
} from '../utils/packageVariants'

const supabaseRestUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseRestKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string

async function restGet<T>(path: string): Promise<T> {
  const res = await fetch(`${supabaseRestUrl}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseRestKey,
      Authorization: `Bearer ${supabaseRestKey}`,
    },
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json() as Promise<T>
}

async function fetchPackagesFromDb(): Promise<ThemePackage[]> {
  const rows = await restGet<{ data: ThemePackage }[]>(
    'app_packages?select=data&order=sort_order',
  )
  return rows.map((row) => row.data)
}

async function fetchColorScalesFromDb(): Promise<ColorScale[]> {
  const rows = await restGet<{ data: ColorScale }[]>(
    'app_color_scales?select=data&order=sort_order',
  )
  return rows.map((row) => row.data)
}

export interface PackageContent {
  heroImage: string
  galleryImages: string[]
  shoppingCategories: ThemePackage['shoppingCategories']
  placementGuide: { element: string; wall: string; height: string; notes: string }[]
}

interface DataContextValue {
  packages: ThemePackage[]
  colorScales: ColorScale[]
  loading: boolean
  persisted: boolean
  reload: () => Promise<void>
  getPackageById: (id: string) => ThemePackage | undefined
  findMatchingPackages: (
    gender: 'boy' | 'girl' | 'unisex',
    age: number,
    theme?: string,
    colorPreference?: string,
  ) => ThemePackage[]
  getPackageContent: (id: string) => PackageContent | null
  getColorScaleForPreference: (preference: string) => ColorScale
  savePackage: (pkg: ThemePackage, sortOrder?: number) => Promise<void>
  deletePackage: (id: string) => Promise<void>
  saveColorScale: (scale: ColorScale, sortOrder?: number) => Promise<void>
  deleteColorScale: (id: string) => Promise<void>
  seedFromStatic: () => Promise<void>
  uploadImage: (file: File, folder?: 'package-gallery' | 'product') => Promise<string>
}

const DataContext = createContext<DataContextValue | null>(null)

function getStaticVariants(scales: ColorScale[] = staticColorScales): ThemePackage[] {
  return expandBasePackagesToVariants(
    staticPackages.filter((pkg) => isBasePackageId(pkg.id)),
    scales,
  )
}

function matchScale(scales: ColorScale[], preference: string): ColorScale {
  if (preference) {
    for (const scale of scales) {
      if (scale.questionnaireKeywords.some((keyword) => preference.includes(keyword))) {
        return scale
      }
    }
  }
  return scales[0]
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [packages, setPackages] = useState<ThemePackage[]>(getStaticVariants())
  const [colorScales, setColorScales] = useState<ColorScale[]>(staticColorScales)
  const [loading, setLoading] = useState(true)
  const [persisted, setPersisted] = useState(false)

  const reload = useCallback(async () => {
    try {
      const fetchData = Promise.all([fetchPackagesFromDb(), fetchColorScalesFromDb()])
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Data load timeout')), 8000),
      )
      const [loaded, scalesLoaded] = await Promise.race([fetchData, timeout])

      if (loaded.length > 0) {
        const scales = scalesLoaded.length > 0 ? scalesLoaded : staticColorScales
        setPackages(
          hasVariantPackages(loaded)
            ? loaded
            : mergeVariantsWithExisting(
                staticPackages.filter((pkg) => isBasePackageId(pkg.id)),
                loaded,
                scales,
              ),
        )
        setPersisted(true)
      } else {
        setPackages(getStaticVariants())
        setPersisted(false)
      }

      if (scalesLoaded.length > 0) {
        setColorScales(scalesLoaded)
      } else {
        setColorScales(staticColorScales)
      }
    } catch {
      setPackages(getStaticVariants())
      setColorScales(staticColorScales)
      setPersisted(false)
    }
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
  }, [reload])

  const getPackageById = useCallback(
    (id: string) => {
      const direct = packages.find((p) => p.id === id)
      if (direct) return direct
      if (isBasePackageId(id)) {
        return packages.find((p) => p.id.startsWith(`${id}-`))
      }
      return undefined
    },
    [packages],
  )

  const findMatchingPackages = useCallback(
    (gender: 'boy' | 'girl' | 'unisex', age: number, theme?: string, colorPreference?: string) => {
      const basePackages = staticPackages.filter((pkg) =>
        BASE_PACKAGE_IDS.includes(pkg.id as (typeof BASE_PACKAGE_IDS)[number]),
      )

      const matched = resolveMatchingPackage(
        packages,
        basePackages,
        colorScales,
        gender,
        age,
        theme,
        colorPreference,
      )
      if (matched) return [matched]

      const fallback = packages.filter((pkg) => {
        const genderMatch =
          pkg.gender === gender || pkg.gender === 'unisex' || gender === 'unisex'
        const ageMatch = age >= pkg.ageRange[0] && age <= pkg.ageRange[1]
        return genderMatch && ageMatch
      })

      return fallback.length > 0 ? fallback : packages
    },
    [packages, colorScales],
  )

  const getPackageContent = useCallback(
    (id: string): PackageContent | null => {
      const pkg = packages.find((p) => p.id === id)
      if (!pkg) return null
      const gallery = resolvePackageGalleryImages(pkg, packages)
      return {
        heroImage: gallery.heroImage,
        galleryImages: gallery.galleryImages,
        shoppingCategories: pkg.shoppingCategories,
        placementGuide: [],
      }
    },
    [packages],
  )

  const getColorScaleForPreference = useCallback(
    (preference: string) => matchScale(colorScales, preference),
    [colorScales],
  )

  const savePackage = useCallback(
    async (pkg: ThemePackage, sortOrder?: number) => {
      const packagesToSave: ThemePackage[] = [pkg]

      if (hasCustomGallery(pkg)) {
        const baseId = getBasePackageId(pkg)
        for (const sibling of packages) {
          if (sibling.id === pkg.id) continue
          if (getBasePackageId(sibling) !== baseId) continue
          if (hasCustomGallery(sibling)) continue
          packagesToSave.push({
            ...sibling,
            heroImage: pkg.heroImage,
            galleryImages: pkg.galleryImages,
          })
        }
      }

      const rows = packagesToSave.map((entry) => ({
        id: entry.id,
        sort_order: sortOrder ?? packages.findIndex((p) => p.id === entry.id),
        data: entry,
        updated_at: new Date().toISOString(),
      }))

      const { error } = await supabase.from('app_packages').upsert(rows)
      if (error) throw error
      await reload()
    },
    [packages, reload],
  )

  const deletePackage = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('app_packages').delete().eq('id', id)
      if (error) throw error
      await reload()
    },
    [reload],
  )

  const saveColorScale = useCallback(
    async (scale: ColorScale, sortOrder?: number) => {
      const { error } = await supabase.from('app_color_scales').upsert({
        id: scale.id,
        sort_order: sortOrder ?? colorScales.findIndex((s) => s.id === scale.id),
        data: scale,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      await reload()
    },
    [colorScales, reload],
  )

  const deleteColorScale = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('app_color_scales').delete().eq('id', id)
      if (error) throw error
      await reload()
    },
    [reload],
  )

  const seedFromStatic = useCallback(async () => {
    let existing: ThemePackage[] = []
    try {
      existing = await fetchPackagesFromDb()
    } catch {
      existing = []
    }

    const variants = mergeVariantsWithExisting(
      staticPackages.filter((pkg) => isBasePackageId(pkg.id)),
      existing,
      staticColorScales,
    )

    const packageRows = variants.map((pkg, index) => ({
      id: pkg.id,
      sort_order: index,
      data: pkg,
      updated_at: new Date().toISOString(),
    }))
    const scaleRows = staticColorScales.map((scale, index) => ({
      id: scale.id,
      sort_order: index,
      data: scale,
      updated_at: new Date().toISOString(),
    }))

    const [pkgRes, scaleRes, deleteRes] = await Promise.all([
      supabase.from('app_packages').upsert(packageRows),
      supabase.from('app_color_scales').upsert(scaleRows),
      supabase.from('app_packages').delete().in('id', [...BASE_PACKAGE_IDS]),
    ])
    if (pkgRes.error) throw pkgRes.error
    if (scaleRes.error) throw scaleRes.error
    if (deleteRes.error) throw deleteRes.error
    await reload()
  }, [reload])

  const uploadImage = useCallback(async (file: File, folder: 'package-gallery' | 'product' = 'package-gallery') => {
    const ext = file.name.split('.').pop() || 'png'
    const path = `${folder}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('package-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('package-images').getPublicUrl(path)
    return data.publicUrl
  }, [])

  const value = useMemo(
    () => ({
      packages,
      colorScales,
      loading,
      persisted,
      reload,
      getPackageById,
      findMatchingPackages,
      getPackageContent,
      getColorScaleForPreference,
      savePackage,
      deletePackage,
      saveColorScale,
      deleteColorScale,
      seedFromStatic,
      uploadImage,
    }),
    [
      packages,
      colorScales,
      loading,
      persisted,
      reload,
      getPackageById,
      findMatchingPackages,
      getPackageContent,
      getColorScaleForPreference,
      savePackage,
      deletePackage,
      saveColorScale,
      deleteColorScale,
      seedFromStatic,
      uploadImage,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
