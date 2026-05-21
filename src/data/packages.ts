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

export const packages: Package[] = [
  {
    id: 'jungle-adventure',
    name: 'הרפתקת ג׳ונגל',
    price: 495,
    gender: 'unisex',
    ageRange: [3, 7],
    theme: 'חיות וטבע',
    colorPalette: ['#4a7c59', '#8fbc8f', '#f4e4c1', '#d4a574', '#e8f5e9'],
    description: 'הביאו את הטבע הפראי הביתה עם חיות ספארי, צמחים טרופיים וגוונים אדמתיים.',
    previewImage: 'jungle',
    includes: ['מדבקות קיר', 'תאורה', 'פתרונות אחסון', 'פריטי קישוט', 'טקסטיל'],
  },
  {
    id: 'ocean-dreams',
    name: 'חלומות אוקיינוס',
    price: 530,
    gender: 'unisex',
    ageRange: [5, 9],
    theme: 'אוקיינוס וחיי ים',
    colorPalette: ['#0077be', '#4fb3d9', '#a8d8ea', '#f9f7f3', '#ffb347'],
    description: 'צללו לתוך עולם תת-ימי עם יצורי ים, גלים וגוני כחול מרגיעים.',
    previewImage: 'ocean',
    includes: ['מדבקות קיר', 'תאורה', 'פתרונות אחסון', 'פריטי קישוט', 'טקסטיל'],
  },
  {
    id: 'space-explorer',
    name: 'חוקר החלל',
    price: 520,
    gender: 'boy',
    ageRange: [6, 10],
    theme: 'חלל ואסטרונומיה',
    colorPalette: ['#1a1f3a', '#2d4b73', '#4a7ba7', '#f4a261', '#e9c46a'],
    description: 'הפכו את החדר להרפתקה קוסמית עם כוכבים, כוכבי לכת ואסטרונאוטים.',
    previewImage: 'space',
    includes: ['מדבקות קיר', 'תאורה', 'פתרונות אחסון', 'פריטי קישוט', 'טקסטיל'],
  },
  {
    id: 'princess-castle',
    name: 'ארמון הנסיכה',
    price: 540,
    gender: 'girl',
    ageRange: [4, 9],
    theme: 'מלכות ופנטזיה',
    colorPalette: ['#f3e5f5', '#ce93d8', '#ffd700', '#ffffff', '#ffe4e1'],
    description: 'אלגנטיות מלכותית עם טירות, כתרים ומבטאים סגולים וזהובים רכים.',
    previewImage: 'princess',
    includes: ['מדבקות קיר', 'תאורה', 'פתרונות אחסון', 'פריטי קישוט', 'טקסטיל'],
  },
]

const themeKeywords: Record<string, string[]> = {
  'מסע בחלל': ['חלל', 'אסטרונומיה'],
  "גיבורי על ג'וניור": ['גיבור', 'על'],
  'עולם הדינוזאורים': ['טבע', 'חיות', 'ג׳ונגל'],
  'חוקר טבע קטן': ['טבע', 'חיות', 'ג׳ונגל'],
}

export function findMatchingPackages(
  gender: 'boy' | 'girl' | 'unisex',
  age: number,
  theme?: string,
): Package[] {
  const keywords = theme ? themeKeywords[theme] ?? [theme] : []

  const matches = packages.filter((pkg) => {
    const genderMatch =
      pkg.gender === gender || pkg.gender === 'unisex' || gender === 'unisex'
    const ageMatch = age >= pkg.ageRange[0] && age <= pkg.ageRange[1]
    const themeMatch =
      keywords.length === 0 ||
      keywords.some(
        (kw) =>
          pkg.theme.toLowerCase().includes(kw.toLowerCase()) ||
          pkg.name.toLowerCase().includes(kw.toLowerCase()) ||
          pkg.description.toLowerCase().includes(kw.toLowerCase()),
      )
    return genderMatch && ageMatch && themeMatch
  })

  if (matches.length > 0) return matches

  return packages.filter((pkg) => {
    const genderMatch =
      pkg.gender === gender || pkg.gender === 'unisex' || gender === 'unisex'
    const ageMatch = age >= pkg.ageRange[0] && age <= pkg.ageRange[1]
    return genderMatch && ageMatch
  })
}
