import rawPackages from './themePackages.json'

export interface ThemeShoppingItem {
  name: string
  link: string
  backupLink?: string
  notes?: string
  room?: string
  image: string
  /** Hidden from customers without deleting it. */
  hidden?: boolean
}

export interface ThemeShoppingCategory {
  category: string
  items: ThemeShoppingItem[]
}

export interface ThemePackage {
  id: string
  name: string
  theme: string
  questionnaireTheme: string
  price: number
  gender: 'boy' | 'girl' | 'unisex'
  ageRange: [number, number]
  colorPalette: string[]
  description: string
  previewImage: string
  includes: string[]
  heroImage: string
  galleryImages: string[]
  shoppingCategories: ThemeShoppingCategory[]
}

/** Shopping list as customers see it: hidden items and empty categories removed. */
export function visibleShoppingCategories(categories: ThemeShoppingCategory[]): ThemeShoppingCategory[] {
  return categories
    .map((category) => ({ ...category, items: category.items.filter((item) => !item.hidden) }))
    .filter((category) => category.items.length > 0)
}

export const themePackages = rawPackages as unknown as ThemePackage[]
