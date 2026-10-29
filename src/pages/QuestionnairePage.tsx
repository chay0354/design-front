import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Heart, Leaf, PaintRoller, User, Users } from 'lucide-react'
import { Sparkle } from '../components/BrushTitle'
import { Header } from '../components/Header'
import { Slider } from '../components/ui/slider'
import { useData } from '../contexts/DataContext'
import { getQuestionnaireOptionsForScales } from '../data/colorScales'
import { filterColorScalesForChild } from '../data/themeColorScales'
import {
  genderLabel,
  getQuestionnaireThemesForChild,
  getSiblingStepInfo,
  getAgeGroupIdForAge,
  totalQuestionnaireSteps,
  type CatalogGender,
  type QuestionnaireChild,
} from '../utils/questionnaire'
import { getAgeGroup } from '../data/packageCatalog'

interface FormData {
  childName: string
  gender: 'boy' | 'girl' | 'unisex' | ''
  age: string
  theme: string
  colorPreference: string
  wallDesignOption: string
  additionalChildren: QuestionnaireChild[]
}

const genderOptions = [
  { value: 'boy' as const, label: 'בן', icon: 'user' },
  { value: 'girl' as const, label: 'בת', icon: 'girl' },
  { value: 'unisex' as const, label: 'ניטרלי', icon: 'users' },
]

function GenderIcon({ type, size = 'lg' }: { type: string; size?: 'lg' | 'sm' }) {
  const dim = size === 'lg' ? 'h-16 w-16' : 'h-8 w-8'
  const color = '#B5A99A'

  if (type === 'users') {
    return <Users className={dim} strokeWidth={1.5} color={color} />
  }
  if (type === 'girl') {
    return (
      <svg
        className={dim}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="7" r="3.5" />
        <path d="M6 20v-1.5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4V20" />
        <path d="M8.5 7.5 L7 11" />
        <path d="M15.5 7.5 L17 11" />
      </svg>
    )
  }
  return <User className={dim} strokeWidth={1.5} color={color} />
}

function ThemePicker({
  childName,
  gender,
  age,
  value,
  onChange,
}: {
  childName: string
  gender: CatalogGender
  age: number
  value: string
  onChange: (theme: string) => void
}) {
  const themes = getQuestionnaireThemesForChild(gender, age)
  const ageGroup = getAgeGroup(getAgeGroupIdForAge(age))

  return (
    <div>
      <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
        איזה נושא {childName}{' '}
        {gender === 'boy' ? 'אוהב' : gender === 'girl' ? 'אוהבת' : 'אוהב/ת'}?
      </h2>
      <p className="mb-6 text-[#6B6B6B]">
        נושאים מותאמים ל{ageGroup.label.toLowerCase()}
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {themes.map((theme) => {
          const isSelected = value === theme.name
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.name)}
              className={`flex items-center justify-center gap-2.5 rounded-md border px-4 py-3.5 text-center text-[15px] text-[#4A4540] transition-all ${
                isSelected
                  ? 'border-[#D9CBBE] bg-[#F3EEE8] shadow-[0_2px_10px_rgba(168,138,114,0.12)]'
                  : 'border-[#E3DBD2] bg-white hover:border-[#D4C4B0]'
              }`}
            >
              {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
              {theme.name}
              {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function scaleTitle(label: string) {
  return label.replace(/[\s\uFE0F]*\p{Extended_Pictographic}\uFE0F?/gu, '').trim()
}

function swatchLuminance(hex: string) {
  const value = Number.parseInt(hex.replace('#', ''), 16)
  const red = (value >> 16) & 255
  const green = (value >> 8) & 255
  const blue = value & 255
  return red * 0.299 + green * 0.587 + blue * 0.114
}

function PaletteIcon({ scaleId }: { scaleId: string }) {
  const stroke = '#A89888'
  if (scaleId === 'soft-pinks') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="17" r="4" fill="#E7B7C0" />
        <circle cx="10.5" cy="13" r="3.2" fill="#F0C9CF" />
        <circle cx="21.5" cy="13" r="3.2" fill="#F0C9CF" />
        <circle cx="11" cy="21" r="3.2" fill="#E3A8B4" />
        <circle cx="21" cy="21" r="3.2" fill="#E3A8B4" />
        <circle cx="16" cy="17" r="1.6" fill="#C98492" />
      </svg>
    )
  }
  if (scaleId === 'elegant-grays') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M16 6l1.2 4.2L21.5 11.4l-4.3 1.2L16 17l-1.2-4.4-4.3-1.2 4.3-1.2L16 6z" fill="#C8C2BA" />
        <path d="M23 16l.7 2.4 2.3.7-2.3.7-.7 2.4-.7-2.4-2.3-.7 2.3-.7L23 16z" fill="#B7B1A8" />
        <path d="M9.5 18l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2z" fill="#D5D0C8" />
      </svg>
    )
  }
  if (scaleId === 'happy-colorful') {
    return (
      <svg viewBox="0 0 36 28" className="h-7 w-9" aria-hidden="true">
        <path d="M4 20c4-8 8-12 14-12s10 4 14 12" fill="none" stroke="#C9A27A" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M7.5 20c3.2-6 6.4-9 10.5-9s7.3 3 10.5 9" fill="none" stroke="#B7C4A4" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 20c2.2-4 4.4-6 7-6s4.8 2 7 6" fill="none" stroke="#E4C2A8" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    )
  }
  if (scaleId === 'calming-blues') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M4 18c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3" fill="none" stroke="#7FA4B8" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 23c3 0 3-3 6-3s3 3 6 3 3-3 6-3 3 3 6 3" fill="none" stroke="#A9C6D4" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  if (scaleId === 'sunny-yellows') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <circle cx="16" cy="16" r="5" fill="#E8C878" />
        <g stroke="#D4B56A" strokeWidth="1.4" strokeLinecap="round">
          <path d="M16 5v3M16 24v3M5 16h3M24 16h3M8.2 8.2l2.1 2.1M21.7 21.7l2.1 2.1M23.8 8.2l-2.1 2.1M10.3 21.7l-2.1 2.1" />
        </g>
      </svg>
    )
  }
  if (scaleId === 'fresh-greens' || scaleId === 'warm-natural') {
    return (
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M16 26V14" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16 18c-5-1-8-5-8-9 5 0 8 4 8 9z" fill="#C5D4B4" stroke="#8A9A78" strokeWidth="1.1" />
        <path d="M16 16c5-1 8-5 8-9-5 0-8 4-8 9z" fill="#D5E0C8" stroke="#8A9A78" strokeWidth="1.1" />
      </svg>
    )
  }
  return null
}

function ColorPalettePreview({
  swatches,
}: {
  swatches: { hex: string; name: string }[]
}) {
  const ordered = [...swatches].sort((a, b) => swatchLuminance(a.hex) - swatchLuminance(b.hex))

  return (
    <div className="flex h-10 overflow-hidden rounded-md" dir="ltr">
      {ordered.map((swatch, index) => (
        <div
          key={`${swatch.hex}-${index}`}
          className="min-w-0 flex-1"
          style={{ backgroundColor: swatch.hex }}
          title={swatch.name}
        />
      ))}
    </div>
  )
}

function ColorPicker({
  gender,
  age,
  theme,
  value,
  onChange,
}: {
  childName: string
  gender: CatalogGender
  age: number
  theme: string
  value: string
  onChange: (colorPreference: string) => void
}) {
  const { colorScales } = useData()
  const options = getQuestionnaireOptionsForScales(
    filterColorScalesForChild(colorScales, gender, age, theme),
  )

  return (
    <div className="-m-2 rounded-lg bg-[#F8F4EF] px-3 py-6 sm:-m-4 sm:px-8 sm:py-8">
      <h2 className="mb-2 flex items-center justify-center gap-3 text-center text-[1.9rem] font-light leading-snug text-[#3C3834]">
        <Sparkle className="h-3.5 w-3.5 text-[#D2A98F]" />
        בחרי את סקלת הגוונים שלך
        <Sparkle className="h-3.5 w-3.5 text-[#D2A98F]" />
      </h2>
      <p className="mb-8 text-center text-base text-[#7A726A]">סגנונות מותאמים לחלומות גדולים</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {options.map((pref) => {
          const isSelected = value === pref.name
          return (
            <button
              key={pref.scaleId}
              type="button"
              onClick={() => onChange(pref.name)}
              className={`rounded-lg border bg-[#FDFBF9] px-3.5 pt-4 pb-5 text-center transition-all ${
                isSelected
                  ? 'border-[#C9B5A3] shadow-[0_6px_20px_rgba(168,138,114,0.2)] ring-1 ring-[#C9B5A3]'
                  : 'border-[#E3DBD2] shadow-[0_2px_8px_rgba(120,100,80,0.06)] hover:border-[#D4C4B0]'
              }`}
            >
              <ColorPalettePreview swatches={pref.swatches} />
              <div className="mt-4 flex flex-col items-center gap-1.5">
                <PaletteIcon scaleId={pref.scaleId} />
                <h3 className="flex items-center gap-2 text-center text-[1.6rem] font-light leading-tight text-[#3C3834]">
                  {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
                  {scaleTitle(pref.name)}
                  {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
                </h3>
              </div>
              {pref.benefit && (
                <p className="mx-auto mt-1.5 max-w-[17rem] text-[13px] leading-6 text-[#6F6760]">{pref.benefit}</p>
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-6 flex items-center gap-2" aria-hidden="true">
        <span className="h-px flex-1 bg-[#E9E1D8]" />
        <Heart className="h-3 w-3 text-[#B8A899]" strokeWidth={1.4} />
        <span className="h-px flex-1 bg-[#E9E1D8]" />
      </div>
      <p className="mt-2 flex items-center justify-center gap-2 text-center text-[13px] text-[#5A544E]">
        <Leaf className="h-4 w-4 shrink-0 text-[#B8AD9C]" strokeWidth={1.4} />
        כל סקלת צבעים נבחרה בקפידה כדי ליצור חלל שמזין את הדמיון, מרגיע את הלב ומלווה את הילד להתפתחות.
      </p>
    </div>
  )
}

function WallDesignPicker({
  childName,
  value,
  onChange,
}: {
  childName: string
  value: string
  onChange: (wallDesignOption: string) => void
}) {
  const options = [
    {
      value: 'covering',
      title: 'חיפוי קיר דקורטיבי',
      text: 'פתרון מעוצב ללא לכלוך של צבע, עם אפשרות להסרה בקלות.',
      image: '/assets/wall-panel.jpg',
      icon: <PanelIcon />,
    },
    {
      value: 'paint',
      title: 'קיר כוח בצביעה',
      text: 'צביעת קיר אחד – עבודה פשוטה יחסית. בסיס על-זמני שמתאים לכל גיל.',
      image: '/assets/wall-paint.jpg',
      icon: <PaintRoller className="h-12 w-12" strokeWidth={1} />,
    },
  ]

  return (
    <div>
      <h2 className="mb-2 text-center text-2xl font-light text-[#3C3834] sm:text-[2rem]">
        איך תרצו לעצב את הקיר המרכזי של {childName}?
      </h2>
      <p className="mb-6 text-center text-sm text-[#6B6B6B]">בחר/י את האופציה המתאימה לחדר שלו/ה</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`overflow-hidden rounded-md border bg-white text-right transition-all ${
                isSelected
                  ? 'border-[#C9B5A3] shadow-[0_6px_20px_rgba(168,138,114,0.2)] ring-1 ring-[#C9B5A3]'
                  : 'border-[#E3DBD2] hover:border-[#D4C4B0]'
              }`}
            >
              <img src={option.image} alt="" className="aspect-[3/2] w-full object-cover" />
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div>
                  <h3 className="mb-1.5 flex items-center gap-2 text-lg font-medium text-[#3C3834] sm:text-xl">
                    {option.title}
                    {isSelected && <Sparkle className="h-3 w-3 text-[#B39A86]" />}
                  </h3>
                  <p className="text-[13px] leading-6 text-[#5A544E]">{option.text}</p>
                </div>
                <span className="shrink-0 text-[#C2A893]">{option.icon}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PanelIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth="1">
      <rect x="6" y="6" width="28" height="28" rx="1" />
      <path d="M6 9h28M6 31h28M12 9v22M18 9v22M24 9v22M30 9v22" />
    </svg>
  )
}

export function QuestionnairePage() {
  const navigate = useNavigate()
  const { colorScales } = useData()

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'השאלון | PETITE DREAMS'
    return () => {
      document.title = previousTitle
    }
  }, [])
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    childName: '',
    gender: '',
    age: '5',
    theme: '',
    colorPreference: '',
    wallDesignOption: '',
    additionalChildren: [],
  })
  const [showAddChild, setShowAddChild] = useState(false)
  const [newChildName, setNewChildName] = useState('')
  const [newChildAge, setNewChildAge] = useState(5)
  const [newChildGender, setNewChildGender] = useState<'boy' | 'girl' | 'unisex' | ''>('')

  const totalSteps = totalQuestionnaireSteps(formData.additionalChildren.length)

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      const queryParams = new URLSearchParams({
        childName: formData.childName,
        gender: formData.gender,
        age: formData.age,
        theme: formData.theme,
        colorPreference: formData.colorPreference,
        wallDesignOption: formData.wallDesignOption,
        additionalChildren: JSON.stringify(formData.additionalChildren),
      })
      window.scrollTo(0, 0)
      navigate(`/preview/recommended?${queryParams.toString()}`)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceed = () => {
    if (step === 1) return formData.childName.trim() !== ''
    if (step === 2) return formData.gender !== ''
    if (step === 3) return formData.age !== ''
    if (step === 4) return formData.theme !== ''
    if (step === 5) return formData.colorPreference !== ''
    if (step === 6) return formData.wallDesignOption !== ''

    const siblingStep = getSiblingStepInfo(step)
    if (!siblingStep) return false

    const child = formData.additionalChildren[siblingStep.childIndex]
    if (!child) return false

    if (siblingStep.stepType === 'theme') return child.theme !== ''
    if (siblingStep.stepType === 'color') return child.colorPreference !== ''
    return child.wallDesignOption !== ''
  }

  const handleAddChild = () => {
    if (newChildName.trim() && newChildGender) {
      setFormData({
        ...formData,
        additionalChildren: [
          ...formData.additionalChildren,
          {
            name: newChildName,
            age: newChildAge,
            gender: newChildGender,
            theme: '',
            colorPreference: '',
            wallDesignOption: '',
          },
        ],
      })
      setNewChildName('')
      setNewChildAge(5)
      setNewChildGender('')
      setShowAddChild(false)
    }
  }

  const handleRemoveChild = (index: number) => {
    const additionalChildren = formData.additionalChildren.filter((_, i) => i !== index)
    const newTotal = totalQuestionnaireSteps(additionalChildren.length)
    setFormData({ ...formData, additionalChildren })
    if (step > newTotal) setStep(newTotal)
  }

  const updateSibling = (index: number, partial: Partial<QuestionnaireChild>) => {
    const updated = [...formData.additionalChildren]
    updated[index] = { ...updated[index], ...partial }
    setFormData({ ...formData, additionalChildren: updated })
  }

  const siblingStep = getSiblingStepInfo(step)
  const activeSibling =
    siblingStep && siblingStep.childIndex < formData.additionalChildren.length
      ? formData.additionalChildren[siblingStep.childIndex]
      : null

  const colorPreferenceStillValid = (
    gender: CatalogGender,
    age: number,
    theme: string,
    colorPreference: string,
  ) => {
    if (!theme || !colorPreference) return false
    const options = getQuestionnaireOptionsForScales(
      filterColorScalesForChild(colorScales, gender, age, theme),
    )
    return options.some((option) => option.name === colorPreference)
  }

  const applyThemeChange = (theme: string) => {
    const gender = formData.gender as CatalogGender
    const age = parseInt(formData.age, 10)
    const colorStillValid = colorPreferenceStillValid(
      gender,
      age,
      theme,
      formData.colorPreference,
    )
    setFormData({
      ...formData,
      theme,
      colorPreference: colorStillValid ? formData.colorPreference : '',
    })
  }

  const applySiblingThemeChange = (index: number, theme: string) => {
    const child = formData.additionalChildren[index]
    const colorStillValid = colorPreferenceStillValid(
      child.gender,
      child.age,
      theme,
      child.colorPreference,
    )
    updateSibling(index, {
      theme,
      colorPreference: colorStillValid ? child.colorPreference : '',
    })
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div
        className={`mx-auto px-4 py-12 sm:px-6 lg:px-8 ${
          step === 6 || siblingStep?.stepType === 'wall' ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[#8B8B8B]">
              שלב {step} מתוך {totalSteps}
            </span>
            <span
              aria-label={`${Math.round((step / totalSteps) * 100)}%`}
              data-percent={`${Math.round((step / totalSteps) * 100)}%`}
              className="text-sm text-[#8B8B8B] before:content-[attr(data-percent)]"
            />
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#F0EBE5]">
            <div
              className="h-full bg-[#C8B6A6] transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          {activeSibling && (
            <p className="mt-3 text-center text-sm text-[#C8B6A6]">
              מגדירים את החבילה של {activeSibling.name} ({genderLabel(activeSibling.gender)},{' '}
              {activeSibling.age} שנים)
            </p>
          )}
        </div>

        <div className="rounded-md border border-[#EAE3DB] bg-white p-6 shadow-[0_2px_10px_rgba(120,100,80,0.05)] sm:p-8 md:p-10">
          {step === 1 && (
            <div>
              <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">מה שם הילד/ה שלך?</h2>
              <p className="mb-6 text-[#6B6B6B]">נשתמש בזה כדי להתאים אישית את חבילת העיצוב</p>
              <input
                type="text"
                value={formData.childName}
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                placeholder="הכנס/י את שם הילד/ה"
                className="w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-4 py-3 focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                מה המגדר של {formData.childName}?
              </h2>
              <p className="mb-6 text-[#6B6B6B]">זה עוזר לנו להמליץ על הנושאים הטובים ביותר</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {genderOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const nextGender = option.value
                      const themes = getQuestionnaireThemesForChild(
                        nextGender,
                        parseInt(formData.age, 10) || 5,
                      )
                      const themeStillValid = themes.some((t) => t.name === formData.theme)
                      setFormData({
                        ...formData,
                        gender: nextGender,
                        theme: themeStillValid ? formData.theme : '',
                      })
                    }}
                    className={`rounded-sm border-2 p-6 transition-all ${
                      formData.gender === option.value
                        ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                        : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                    }`}
                  >
                    <div className="mb-3 flex justify-center">
                      <GenderIcon type={option.icon} />
                    </div>
                    <div className="font-normal">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                {formData.gender === 'boy'
                  ? 'בן כמה'
                  : formData.gender === 'girl'
                    ? 'בת כמה'
                    : 'בן/בת כמה'}{' '}
                {formData.childName}?
              </h2>
              <p className="mb-6 text-[#6B6B6B]">עיצובים מותאמים לגיל עושים את כל ההבדל</p>

              <div className="mb-8" dir="ltr">
                <div className="mb-6 text-center">
                  <span className="text-5xl font-light text-[#C8B6A6]">{formData.age}</span>
                  <span className="ml-2 text-2xl text-[#8B8B8B]">שנים</span>
                </div>
                <Slider
                  value={[parseInt(formData.age, 10)]}
                  onValueChange={(value) => {
                    const themes =
                      formData.gender !== ''
                        ? getQuestionnaireThemesForChild(
                            formData.gender as CatalogGender,
                            value[0],
                          )
                        : []
                    const themeStillValid = themes.some((t) => t.name === formData.theme)
                    setFormData({
                      ...formData,
                      age: value[0].toString(),
                      theme: themeStillValid ? formData.theme : '',
                    })
                  }}
                  min={1}
                  max={12}
                  step={1}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-sm text-[#8B8B8B]">
                  <span>1</span>
                  <span>12</span>
                </div>
              </div>

              <div className="mt-8 border-t border-[#E8DED2] pt-8">
                <h3 className="mb-4 text-xl font-light text-[#4A4A4A]">יש לכם עוד ילדים?</h3>
                <p className="mb-4 text-base font-normal text-[#7BA05B]">
                  הוסיפו אח/אחות — לכל ילד/ה תבחרו נושא, צבעים וקיר בנפרד, עם 20% הנחה על כל
                  חבילה נוספת!
                </p>

                {formData.additionalChildren.map((child, index) => (
                  <div
                    key={index}
                    className="mb-2 flex items-center justify-between rounded-sm bg-[#F9F7F4] p-4"
                  >
                    <span className="text-[#4A4A4A]">
                      {child.name} ({child.age} שנים, {genderLabel(child.gender)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChild(index)}
                      className="text-sm text-[#C87C7C] hover:text-[#B56B6B]"
                    >
                      הסר
                    </button>
                  </div>
                ))}

                {!showAddChild && formData.additionalChildren.length < 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAddChild(true)}
                    className="w-full rounded-sm border-2 border-dashed border-[#C8B6A6] py-3 text-[#C8B6A6] transition-colors hover:bg-[#F9F7F4]"
                  >
                    + הוסף אח/אחות
                  </button>
                )}

                {showAddChild && (
                  <div className="space-y-4 rounded-sm bg-[#F9F7F4] p-4">
                    <input
                      type="text"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      placeholder="שם הילד/ה"
                      className="w-full rounded-sm border border-[#E8DED2] px-4 py-2 focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none"
                    />
                    <div>
                      <label className="mb-2 block text-sm text-[#6B6B6B]">מגדר</label>
                      <div className="grid grid-cols-3 gap-2">
                        {genderOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => setNewChildGender(option.value)}
                            className={`rounded-sm border-2 p-3 transition-all ${
                              newChildGender === option.value
                                ? 'border-[#C8B6A6] bg-white'
                                : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                            }`}
                          >
                            <div className="mb-1 flex justify-center">
                              <GenderIcon type={option.icon} size="sm" />
                            </div>
                            <div className="text-xs">{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div dir="ltr">
                      <label className="mb-2 block text-sm text-[#6B6B6B]">גיל</label>
                      <div className="mb-2 text-center">
                        <span className="text-2xl font-light text-[#C8B6A6]">{newChildAge}</span>
                        <span className="ml-2 text-lg text-[#8B8B8B]">שנים</span>
                      </div>
                      <Slider
                        value={[newChildAge]}
                        onValueChange={(value) => setNewChildAge(value[0])}
                        min={1}
                        max={12}
                        step={1}
                      />
                      <div className="mt-2 flex justify-between text-sm text-[#8B8B8B]">
                        <span>1</span>
                        <span>12</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddChild}
                        disabled={!newChildName.trim() || !newChildGender}
                        className={`flex-1 rounded-sm py-2 transition-colors ${
                          newChildName.trim() && newChildGender
                            ? 'bg-[#C8B6A6] text-white hover:bg-[#B5A99A]'
                            : 'cursor-not-allowed bg-[#E8DED2] text-[#C5C5C5]'
                        }`}
                      >
                        הוסף
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddChild(false)
                          setNewChildName('')
                          setNewChildAge(5)
                          setNewChildGender('')
                        }}
                        className="flex-1 rounded-sm bg-[#F5F1ED] py-2 text-[#6B6B6B] hover:bg-[#E8DED2]"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && formData.gender !== '' && (
            <ThemePicker
              childName={formData.childName}
              gender={formData.gender as CatalogGender}
              age={parseInt(formData.age, 10)}
              value={formData.theme}
              onChange={applyThemeChange}
            />
          )}

          {step === 5 && formData.gender !== '' && formData.theme !== '' && (
            <ColorPicker
              childName={formData.childName}
              gender={formData.gender as CatalogGender}
              age={parseInt(formData.age, 10)}
              theme={formData.theme}
              value={formData.colorPreference}
              onChange={(colorPreference) => setFormData({ ...formData, colorPreference })}
            />
          )}

          {step === 6 && (
            <WallDesignPicker
              childName={formData.childName}
              value={formData.wallDesignOption}
              onChange={(wallDesignOption) => setFormData({ ...formData, wallDesignOption })}
            />
          )}

          {activeSibling && siblingStep?.stepType === 'theme' && (
            <ThemePicker
              childName={activeSibling.name}
              gender={activeSibling.gender}
              age={activeSibling.age}
              value={activeSibling.theme}
              onChange={(theme) => applySiblingThemeChange(siblingStep.childIndex, theme)}
            />
          )}

          {activeSibling && siblingStep?.stepType === 'color' && activeSibling.theme !== '' && (
            <ColorPicker
              childName={activeSibling.name}
              gender={activeSibling.gender}
              age={activeSibling.age}
              theme={activeSibling.theme}
              value={activeSibling.colorPreference}
              onChange={(colorPreference) =>
                updateSibling(siblingStep.childIndex, { colorPreference })
              }
            />
          )}

          {activeSibling && siblingStep?.stepType === 'wall' && (
            <WallDesignPicker
              childName={activeSibling.name}
              value={activeSibling.wallDesignOption}
              onChange={(wallDesignOption) =>
                updateSibling(siblingStep.childIndex, { wallDesignOption })
              }
            />
          )}

          <div className="mt-8 flex items-center justify-between border-t border-[#E8DED2] pt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 rounded-sm px-6 py-3 transition-colors ${
                step === 1
                  ? 'cursor-not-allowed text-[#C5C5C5]'
                  : 'text-[#6B6B6B] hover:bg-[#F9F7F4]'
              }`}
            >
              <ArrowRight className="h-4 w-4" />
              חזור
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-2 rounded-sm px-6 py-3 transition-all ${
                canProceed()
                  ? 'bg-[#C8B6A6] text-white shadow-sm hover:bg-[#B5A99A]'
                  : 'cursor-not-allowed bg-[#E8DED2] text-[#C5C5C5]'
              }`}
            >
              {step === totalSteps ? 'סיים' : 'הבא'}
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
