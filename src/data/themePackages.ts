import rawPackages from './themePackages.json'

export interface ThemeShoppingItem {
  name: string
  link: string
  backupLink?: string
  notes?: string
  room?: string
  image: string
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

export const themePackages = rawPackages as unknown as ThemePackage[]
