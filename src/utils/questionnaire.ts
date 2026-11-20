import { getColorScaleForPreference } from '../data/colorScales'
import {
  getAgeGroup,
  getAgeGroupIdForAge,
  getQuestionnaireThemesForChild,
  PACKAGE_AGE_GROUPS,
  type CatalogGender,
  type PackageAgeGroupId,
} from '../data/packageCatalog'

export interface QuestionnaireChild {
  name: string
  age: number
  gender: 'boy' | 'girl' | 'unisex'
  theme: string
  colorPreference: string
  wallDesignOption: string
}

export interface RoomChild {
  name: string
  gender: 'boy' | 'girl' | 'unisex' | ''
  age: number
}

export type AgeChoice =
  | { type: 'child'; childIndex: number }
  | { type: 'bridge'; ageGroupId: PackageAgeGroupId }

export interface QuestionnaireRoom {
  children: RoomChild[]
  designGender: CatalogGender | ''
  ageChoice: AgeChoice | null
  theme: string
  colorPreference: string
  wallDesignOption: string
}

export type QuestionnaireStep =
  | { kind: 'rooms' }
  | { kind: 'child'; roomIndex: number; childIndex: number }
  | { kind: 'design-gender'; roomIndex: number }
  | { kind: 'design-age'; roomIndex: number }
  | { kind: 'theme'; roomIndex: number }
  | { kind: 'color'; roomIndex: number }
  | { kind: 'wall'; roomIndex: number }

export function emptyRoom(): QuestionnaireRoom {
  return {
    children: [{ name: '', gender: '', age: 5 }],
    designGender: '',
    ageChoice: null,
    theme: '',
    colorPreference: '',
    wallDesignOption: '',
  }
}

export function ageGroupIndex(age: number): number {
  return PACKAGE_AGE_GROUPS.findIndex((group) => group.id === getAgeGroupIdForAge(age))
}

/** Age groups that sit in a full gap between the youngest and oldest child. */
export function bridgeAgeGroups(children: { age: number }[]): PackageAgeGroupId[] {
  if (children.length < 2) return []
  const indexes = children.map((child) => ageGroupIndex(child.age))
  const min = Math.min(...indexes)
  const max = Math.max(...indexes)
  if (max - min < 2) return []
  return PACKAGE_AGE_GROUPS.slice(min + 1, max).map((group) => group.id)
}

export function normalizeRoom(room: QuestionnaireRoom): QuestionnaireRoom {
  let ageChoice = room.ageChoice
  if (ageChoice?.type === 'child' && !room.children[ageChoice.childIndex]) ageChoice = null
  if (
    ageChoice?.type === 'bridge' &&
    !bridgeAgeGroups(room.children).includes(ageChoice.ageGroupId)
  ) {
    ageChoice = null
  }
  const next = { ...room, ageChoice }
  return roomThemeStillValid(next) ? next : { ...next, theme: '', colorPreference: '' }
}

/** Child details first, then each room chooses a design gender and, when shared, an age. */
export function buildQuestionnaireSteps(rooms: QuestionnaireRoom[]): QuestionnaireStep[] {
  const steps: QuestionnaireStep[] = [{ kind: 'rooms' }]
  rooms.forEach((room, roomIndex) => {
    room.children.forEach((_, childIndex) => {
      steps.push({ kind: 'child', roomIndex, childIndex })
    })
  })
  rooms.forEach((room, roomIndex) => {
    steps.push({ kind: 'design-gender', roomIndex })
    if (room.children.length > 1) steps.push({ kind: 'design-age', roomIndex })
    steps.push({ kind: 'theme', roomIndex })
    steps.push({ kind: 'color', roomIndex })
    steps.push({ kind: 'wall', roomIndex })
  })
  return steps
}

/** The package follows the gender and age chosen for the room, not each child's own details. */
export function roomDesignProfile(room: QuestionnaireRoom): { gender: CatalogGender; age: number } {
  const gender: CatalogGender = room.designGender || 'unisex'
  if (room.ageChoice?.type === 'child') {
    const child = room.children[room.ageChoice.childIndex]
    if (child) return { gender, age: child.age }
  }
  if (room.ageChoice?.type === 'bridge') {
    return { gender, age: getAgeGroup(room.ageChoice.ageGroupId).range[0] || 1 }
  }
  if (room.children.length === 1) return { gender, age: room.children[0].age }
  const oldest = room.children.reduce(
    (lead, child) => (child.age > lead.age ? child : lead),
    room.children[0],
  )
  return { gender, age: oldest?.age || 5 }
}

export function roomThemeStillValid(room: QuestionnaireRoom): boolean {
  if (!room.theme) return false
  const profile = roomDesignProfile(room)
  return getQuestionnaireThemesForChild(profile.gender, profile.age).some(
    (theme) => theme.name === room.theme,
  )
}

export function formatRoomNames(children: { name: string }[]): string {
  const names = children.map((child) => child.name.trim()).filter(Boolean)
  if (names.length === 0) return 'החדר'
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} ו${names[names.length - 1]}`
}

export const ROOM_PACKAGE_PRICE = 660
export const INSTALLMENT_COUNT = 12
/** Temporary: hide package prices on the customer site. */
export const SHOW_PACKAGE_PRICE = false

export function roomPackagePrice(basePrice: number, roomIndex: number): number {
  return roomIndex === 0 ? basePrice : Math.round(basePrice * 0.8)
}

export function installmentAmount(total: number): number {
  return Math.round(total / INSTALLMENT_COUNT)
}

export function parseRoomsParam(raw: string | null): QuestionnaireRoom[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as QuestionnaireRoom[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

export {
  getQuestionnaireThemesForChild,
  getAgeGroupIdForAge,
  type CatalogGender,
} from '../data/packageCatalog'

export { filterColorScalesForChild } from '../data/themeColorScales'

export function wallDesignLabel(option: string): string {
  if (option === 'paint') return 'קיר מרכזי בצביעה'
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
