export interface ColorSwatch {
  roleLabel: string
  code?: string
  name: string
  hex: string
}

export interface ColorScale {
  id: string
  name: string
  questionnaireKeywords: string[]
  colors: ColorSwatch[]
}

/** Color scales from petite dreams.xlsx — Tambour codes and shade names */
export const colorScales: ColorScale[] = [
  {
    id: 'warm-natural',
    name: 'חמים טבעיים',
    questionnaireKeywords: ['חמים'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', name: 'שמנת חמה', hex: '#E9D7BE' },
      { roleLabel: 'גוון תומך 1', name: 'בז׳ בהיר', hex: '#DAC8B7' },
      { roleLabel: 'גוון תומך 2', name: 'טאופ חם', hex: '#C8BDAE' },
      { roleLabel: 'גוון דגש', name: 'מרווה מאובקת', hex: '#AEB29B' },
    ],
  },
  {
    id: 'calming-blues',
    name: 'סקלת כחולים 1',
    questionnaireKeywords: ['כחול'],
    colors: [
      { roleLabel: 'גוון דגש', name: 'כחול אבקתי', hex: '#4B7184' },
      { roleLabel: 'גוון תומך 1', name: 'כחול רך', hex: '#90B1C0' },
      { roleLabel: 'גוון תומך 2', name: 'כחול בהיר', hex: '#D0DDE3' },
      { roleLabel: 'גוון בסיס — קיר', name: 'שמנת רכה', hex: '#F5EDE2' },
      { roleLabel: 'גוון תומך 3', name: 'בז׳ חם', hex: '#E6DACD' },
    ],
  },
  {
    id: 'fresh-greens',
    name: 'ירוקים 1',
    questionnaireKeywords: ['ירוק'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', code: '415.0', name: 'חאקי בהיר', hex: '#BDB896' },
      { roleLabel: 'גוון תומך 1', name: 'חלוקי נחל', hex: '#B8C5B0' },
      { roleLabel: 'גוון תומך 2', name: 'אפור אקליפטוס', hex: '#9BAA9E' },
      { roleLabel: 'גוון תומך 3', name: 'ירוק פיסטוק בהיר', hex: '#C5D89A' },
      { roleLabel: 'גוון תומך 4', name: 'ירוק זית עמוק', hex: '#6B7A4F' },
      { roleLabel: 'גוון דגש', name: 'ירוק יער כהה', hex: '#3D5034' },
    ],
  },
  {
    id: 'elegant-grays',
    name: 'סקלת אפורים',
    questionnaireKeywords: ['אפור'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', name: 'אפור ענן', hex: '#D8D8D6' },
      { roleLabel: 'גוון תומך 1', name: 'אפור בהיר', hex: '#C5C5C3' },
      { roleLabel: 'גוון תומך 2', name: 'אפור אבן', hex: '#A8AAA9' },
      { roleLabel: 'גוון דגש', name: 'אפור כחלחל', hex: '#868C8C' },
    ],
  },
  {
    id: 'happy-colorful',
    name: 'סקלה צבעונית',
    questionnaireKeywords: ['צבעוני'],
    colors: [
      { roleLabel: 'גוון דגש', name: 'מרווה', hex: '#98A68F' },
      { roleLabel: 'גוון תומך 1', name: 'מרווה בהירה', hex: '#C0CBBA' },
      { roleLabel: 'גוון תומך 2', name: 'טרקוטה רכה', hex: '#CC9978' },
      { roleLabel: 'גוון תומך 3', name: 'אפרסק', hex: '#DFB192' },
      { roleLabel: 'גוון תומך 4', name: 'צהוב חמאה', hex: '#F3D2A6' },
      { roleLabel: 'גוון בסיס — קיר', name: 'ורוד אבקתי', hex: '#EBD5CF' },
    ],
  },
  {
    id: 'soft-pinks',
    name: 'סקלת ורודים',
    questionnaireKeywords: ['ורוד'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', name: 'ורוד אבקה', hex: '#E8C4C4' },
      { roleLabel: 'גוון תומך 1', name: 'ורוד ערב', hex: '#D4939A' },
      { roleLabel: 'גוון תומך 2', name: 'שמנת ורדרד', hex: '#F5E6E8' },
      { roleLabel: 'גוון תומך 3', name: 'ורוד מעושן', hex: '#C9A0A8' },
      { roleLabel: 'גוון תומך 4', name: 'אפרסק עדין', hex: '#E8B4A0' },
      { roleLabel: 'גוון דגש', name: 'ורוד עמוק', hex: '#B87A8A' },
    ],
  },
  {
    id: 'sunny-yellows',
    name: 'סקלת צהובים',
    questionnaireKeywords: ['צהוב'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', name: 'צהוב חלמי', hex: '#F5E6B8' },
      { roleLabel: 'גוון תומך 1', name: 'חמניה עדינה', hex: '#E8C878' },
      { roleLabel: 'גוון תומך 2', name: 'קרם שמש', hex: '#FAF0D4' },
      { roleLabel: 'גוון תומך 3', name: 'חול זהוב', hex: '#D4B878' },
      { roleLabel: 'גוון תומך 4', name: 'אפרסק שמש', hex: '#E8C4A0' },
      { roleLabel: 'גוון דגש', name: 'ענבר חם', hex: '#C9956A' },
    ],
  },
]

export function getColorScaleForPreference(preference: string, scales: ColorScale[] = colorScales): ColorScale {
  if (preference) {
    for (const scale of scales) {
      const label = COLOR_SCALE_QUESTIONNAIRE[scale.id]?.label
      if (label && preference === label) return scale
    }
    for (const scale of scales) {
      if (scale.questionnaireKeywords.some((keyword) => preference.includes(keyword))) {
        return scale
      }
    }
  }
  return scales[0]
}

export const COLOR_SCALE_QUESTIONNAIRE: Record<
  string,
  { label: string; benefit: string; previewColors?: string[] }
> = {
  'warm-natural': {
    label: 'חמים טבעיים 🪵',
    benefit: 'תחושת בית: פלטת מקרקעת שיוצרת חמימות מיידית וגדלה עם הילד באהבה.',
    previewColors: ['#E9D7BE', '#C8BDAE', '#AEB29B'],
  },
  'calming-blues': {
    label: 'כחולים מרגיעים 🌊',
    benefit: 'לילות שקטים: גוונים קרירים המעודדים ויסות רגשי וסביבת שינה מרגיעה.',
    previewColors: ['#4B7184', '#90B1C0', '#D0DDE3'],
  },
  'fresh-greens': {
    label: 'ירוקים מרעננים 🍃',
    benefit: 'אנרגיה של צמיחה: גוונים שמכניסים חיות וסקרנות לחדר מואר ומלא השראה.',
    previewColors: ['#7CB342', '#9CCC65', '#C5E1A5'],
  },
  'elegant-grays': {
    label: 'אפורים אלגנטיים 🌫️',
    benefit: 'הבחירה החכמה: מראה נקי שיוצר שקט בעין ונותן במה לאישיות של הילד.',
    previewColors: ['#D8D8D6', '#A8AAA9', '#868C8C'],
  },
  'happy-colorful': {
    label: 'צבעוניים שמחים 🌈',
    benefit: 'חגיגה יצירתית: שילוב הרמוני שמעודד חיוניות בלי ליצור עומס ויזואלי.',
    previewColors: ['#98A68F', '#CC9978', '#F3D2A6'],
  },
  'soft-pinks': {
    label: 'ורודים עדינים 🌸',
    benefit: 'רכות וחום: גוונים ורודים שיוצרים חדר חלומי, נעים ומלא אהבה.',
    previewColors: ['#E8B4B8', '#D4939A', '#F5D5DA'],
  },
  'sunny-yellows': {
    label: 'צהובים שמשיים ☀️',
    benefit: 'אור ושמחה: גוונים חמים שמביאים אנרגיה של קיץ, חופש וחיוך.',
    previewColors: ['#F5E6B8', '#E8C878', '#FAF0D4'],
  },
}

export function getQuestionnaireLabelForScale(scale: ColorScale): string {
  return COLOR_SCALE_QUESTIONNAIRE[scale.id]?.label ?? scale.name
}

/** The name the customer picked, without the emoji used on the questionnaire cards. */
export function displayColorScaleName(preference: string): string {
  return preference.replace(/[\s\uFE0F]*\p{Extended_Pictographic}\uFE0F?/gu, '').trim()
}

export function getQuestionnaireOptionsForScales(scales: ColorScale[]) {
  return scales.map((scale) => {
    const meta = COLOR_SCALE_QUESTIONNAIRE[scale.id]
    return {
      scaleId: scale.id,
      name: meta?.label ?? scale.name,
      benefit: meta?.benefit ?? '',
      swatches: scale.colors,
      colors: scale.colors.map((swatch) => swatch.hex),
    }
  })
}
