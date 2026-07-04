import { getColorScaleForPreference } from '../data/colorScales'

export interface QuestionnaireChild {
  name: string
  age: number
  gender: 'boy' | 'girl' | 'unisex'
  theme: string
  colorPreference: string
  wallDesignOption: string
}

export {
  getQuestionnaireThemesForChild,
  getAgeGroupIdForAge,
  type CatalogGender,
} from '../data/packageCatalog'

export { filterColorScalesForChild } from '../data/themeColorScales'

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
  const scale = getColorScaleForPreference(colorName)
  return scale.colors.map((swatch) => swatch.hex)
}
