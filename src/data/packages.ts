import { themePackages, type ThemePackage } from './themePackages'

export interface Package {
  id: string
  name: string
  price: number
  gender: 'boy' | 'girl' | 'unisex'
  ageRange: [number, number]
  theme: string
  colorPalette: string[]
  description: string
  previewImage: string
  includes: string[]
}

function toPackage(pkg: ThemePackage): Package {
  const {
    shoppingCategories: _shoppingCategories,
    heroImage: _heroImage,
    galleryImages: _galleryImages,
    questionnaireTheme: _questionnaireTheme,
    ...rest
  } = pkg
  return rest
}

export const packages: Package[] = themePackages.map(toPackage)

const themeToPackageId: Record<string, string> = {
  חיות: 'animals',
  הרפתקאות: 'adventures',
  'ים וספינות': 'sea-ships',
  'כלי תחבורה': 'transport',
}

export function findMatchingPackages(
  gender: 'boy' | 'girl' | 'unisex',
  age: number,
  theme?: string,
): Package[] {
  if (theme && themeToPackageId[theme]) {
    const match = packages.find((pkg) => pkg.id === themeToPackageId[theme])
    if (match) return [match]
  }

  const matches = packages.filter((pkg) => {
    const genderMatch =
      pkg.gender === gender || pkg.gender === 'unisex' || gender === 'unisex'
    const ageMatch = age >= pkg.ageRange[0] && age <= pkg.ageRange[1]
    return genderMatch && ageMatch
  })

  return matches.length > 0 ? matches : packages
}
