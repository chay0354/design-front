export interface QuestionnaireChild {
  name: string
  age: number
  gender: 'boy' | 'girl' | 'unisex'
  theme: string
  colorPreference: string
  wallDesignOption: string
}

export const QUESTIONNAIRE_THEMES = ['חיות', 'הרפתקאות', 'ים וספינות', 'כלי תחבורה'] as const

export const COLOR_PREFERENCES = [
  {
    name: 'חמים טבעיים 🪵',
    benefit:
      'תחושת בית: פלטת מקרקעת שיוצרת חמימות מיידית וגדלה עם הילד באהבה.',
    colors: ['#D4A574', '#8B7355', '#A0826D'],
  },
  {
    name: 'כחולים מרגיעים 🌊',
    benefit: 'לילות שקטים: גוונים קרירים המעודדים ויסות רגשי וסביבת שינה מרגיעה.',
    colors: ['#4A7C9E', '#7BA4C7', '#B0D4E8'],
  },
  {
    name: 'ירוקים מרעננים 🍃',
    benefit: 'אנרגיה של צמיחה: גוונים שמכניסים חיות וסקרנות לחדר מואר ומלא השראה.',
    colors: ['#7CB342', '#9CCC65', '#C5E1A5'],
  },
  {
    name: 'אפורים אלמותיים 🌫️',
    benefit: 'הבחירה החכמה: מראה נקי שיוצר שקט בעין ונותן במה לאישיות של הילד.',
    colors: ['#8E8E8E', '#A8A8A8', '#C5C5C5'],
  },
  {
    name: 'צבעוניים שמחים 🌈',
    benefit: 'חגיגה יצירתית: שילוב הרמוני שמעודד חיוניות בלי ליצור עומס ויזואלי.',
    colors: ['#E57373', '#FFB74D', '#81C784'],
  },
] as const

export const MAIN_CHILD_STEPS = 6
export const STEPS_PER_SIBLING = 3

export function totalQuestionnaireSteps(siblingCount: number): number {
  return MAIN_CHILD_STEPS + STEPS_PER_SIBLING * siblingCount
}

export function getSiblingStepInfo(step: number): {
  childIndex: number
  stepType: 'theme' | 'color' | 'wall'
} | null {
  if (step <= MAIN_CHILD_STEPS) return null
  const offset = step - MAIN_CHILD_STEPS - 1
  const stepTypes = ['theme', 'color', 'wall'] as const
  return {
    childIndex: Math.floor(offset / STEPS_PER_SIBLING),
    stepType: stepTypes[offset % STEPS_PER_SIBLING],
  }
}

export function wallDesignLabel(option: string): string {
  if (option === 'paint') return 'קיר כוח בצביעה'
  if (option === 'covering') return 'חיפוי קיר דקורטיבי'
  return 'לא נבחר'
}

export function genderLabel(gender: string): string {
  if (gender === 'boy') return 'בן'
  if (gender === 'girl') return 'בת'
  return 'ניטרלי'
}

export function getColorPaletteFromName(colorName: string): string[] {
  if (colorName.includes('חמים')) return ['#D4A574', '#8B7355', '#A0826D']
  if (colorName.includes('כחול')) return ['#4A7C9E', '#7BA4C7', '#B0D4E8']
  if (colorName.includes('ירוק')) return ['#7CB342', '#9CCC65', '#C5E1A5']
  if (colorName.includes('אפור')) return ['#8E8E8E', '#A8A8A8', '#C5C5C5']
  if (colorName.includes('צבעוני')) return ['#E57373', '#FFB74D', '#81C784']
  return ['#D4A574', '#8B7355', '#A0826D']
}
