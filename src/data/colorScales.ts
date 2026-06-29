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
]

export function getColorScaleForPreference(preference: string): ColorScale {
  if (preference) {
    for (const scale of colorScales) {
      if (scale.questionnaireKeywords.some((keyword) => preference.includes(keyword))) {
        return scale
      }
    }
  }
  return colorScales[0]
}
