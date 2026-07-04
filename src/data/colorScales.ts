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
      { roleLabel: 'גוון בסיס — קיר', code: '413.0', name: 'פשתן טבעי', hex: '#E8DCC8' },
      { roleLabel: 'גוון תומך 1', name: 'שיבולת שועל', hex: '#D4C4A8' },
      { roleLabel: 'גוון תומך 2', name: 'אפור חם', hex: '#B8A898' },
      { roleLabel: 'גוון תומך 3', name: 'חול חמים', hex: '#C9A87C' },
      { roleLabel: 'גוון דגש', name: 'ירוק פליז עמוק', hex: '#5C6B4A' },
      { roleLabel: 'גוון תומך 4', name: 'שוקולד עמוק', hex: '#5C4033' },
    ],
  },
  {
    id: 'calming-blues',
    name: 'סקלת כחולים 1',
    questionnaireKeywords: ['כחול'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', name: 'כחול סערה', hex: '#4A6670' },
      { roleLabel: 'גוון תומך 1', name: 'עכשיו מעונן', hex: '#8FAAB8' },
      { roleLabel: 'גוון תומך 2', name: 'חלב שקדים', hex: '#F5EDE4' },
      { roleLabel: 'גוון תומך 3', name: 'אבן', hex: '#9E9E94' },
      { roleLabel: 'גוון תומך 4', name: 'חול חמים', hex: '#C9A87C' },
      { roleLabel: 'גוון דגש', name: 'חמרה', hex: '#A65D3F' },
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
      { roleLabel: 'גוון בסיס — קיר', code: 'ngy04', name: 'אפור אורבני', hex: '#8E8E8E' },
      { roleLabel: 'גוון תומך 1', name: 'חלב שקדים', hex: '#F5EDE4' },
      { roleLabel: 'גוון תומך 2', name: 'אפור נוצה', hex: '#D8D8D8' },
      { roleLabel: 'גוון תומך 3', name: 'אפור פשתן', hex: '#C5C0B8' },
      { roleLabel: 'גוון תומך 4', name: 'אפור בזלת', hex: '#6B6B6B' },
      { roleLabel: 'גוון דגש', name: 'גוון אלון טבעי', hex: '#A0826D' },
    ],
  },
  {
    id: 'happy-colorful',
    name: 'סקלה צבעונית',
    questionnaireKeywords: ['צבעוני'],
    colors: [
      { roleLabel: 'גוון בסיס — קיר', code: '448.0', name: 'אקליפטוס מעושן', hex: '#7A8B7E' },
      { roleLabel: 'גוון תומך 1', name: 'טרקוטה', hex: '#C17F59' },
      { roleLabel: 'גוון תומך 2', name: 'פשתן', hex: '#E8DCC4' },
      { roleLabel: 'גוון תומך 3', name: 'מרווה', hex: '#8B9A7A' },
      { roleLabel: 'גוון תומך 4', name: 'עץ מייפל', hex: '#C4956A' },
      { roleLabel: 'גוון דגש', name: 'אגוז עמוק', hex: '#6B4F3A' },
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
    previewColors: ['#D4A574', '#8B7355', '#A0826D'],
  },
  'calming-blues': {
    label: 'כחולים מרגיעים 🌊',
    benefit: 'לילות שקטים: גוונים קרירים המעודדים ויסות רגשי וסביבת שינה מרגיעה.',
    previewColors: ['#4A7C9E', '#7BA4C7', '#B0D4E8'],
  },
  'fresh-greens': {
    label: 'ירוקים מרעננים 🍃',
    benefit: 'אנרגיה של צמיחה: גוונים שמכניסים חיות וסקרנות לחדר מואר ומלא השראה.',
    previewColors: ['#7CB342', '#9CCC65', '#C5E1A5'],
  },
  'elegant-grays': {
    label: 'אפורים אלמותיים 🌫️',
    benefit: 'הבחירה החכמה: מראה נקי שיוצר שקט בעין ונותן במה לאישיות של הילד.',
    previewColors: ['#8E8E8E', '#A8A8A8', '#C5C5C5'],
  },
  'happy-colorful': {
    label: 'צבעוניים שמחים 🌈',
    benefit: 'חגיגה יצירתית: שילוב הרמוני שמעודד חיוניות בלי ליצור עומס ויזואלי.',
    previewColors: ['#E57373', '#FFB74D', '#81C784'],
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
