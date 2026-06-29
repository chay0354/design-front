import { themePackages } from './themePackages'

export interface ShoppingItem {
  name: string
  link: string
  image: string
  price?: string
  notes?: string
  backupLink?: string
}

export interface ShoppingCategory {
  category: string
  items: ShoppingItem[]
}

export interface PlacementGuideItem {
  element: string
  wall: string
  height: string
  notes: string
}

export interface PackageContent {
  heroImage: string
  galleryImages: string[]
  shoppingCategories: ShoppingCategory[]
  placementGuide: PlacementGuideItem[]
}

export function getPackageContent(packageId: string): PackageContent | null {
  const pkg = themePackages.find((p) => p.id === packageId)
  if (!pkg) return null

  return {
    heroImage: pkg.heroImage,
    galleryImages: pkg.galleryImages,
    shoppingCategories: pkg.shoppingCategories.map((category) => ({
      category: category.category,
      items: category.items.map((item) => ({
        name: item.name,
        link: item.link,
        image: item.image,
        notes: item.notes,
        backupLink: item.backupLink,
      })),
    })),
    placementGuide: [],
  }
}
