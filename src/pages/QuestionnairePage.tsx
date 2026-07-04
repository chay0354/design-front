import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Paintbrush,
  Scroll,
  User,
  Users,
} from 'lucide-react'
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
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.name)}
            className={`rounded-sm border-2 p-4 text-center transition-all ${
              value === theme.name
                ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                : 'border-[#E8DED2] hover:border-[#D4C4B0]'
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorPalettePreview({
  swatches,
  selected,
}: {
  swatches: { hex: string; name: string }[]
  selected: boolean
}) {
  return (
    <div
      className={`overflow-hidden rounded-sm border ${
        selected ? 'border-[#C8B6A6] ring-2 ring-[#C8B6A6]/30' : 'border-[#E8DED2]'
      }`}
    >
      <div className="flex h-12">
        {swatches.map((swatch, index) => (
          <div
            key={`${swatch.hex}-${index}`}
            className="min-w-0 flex-1"
            style={{ backgroundColor: swatch.hex }}
            title={swatch.name}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1 bg-[#FDFCFB] p-2">
        {swatches.map((swatch, index) => (
          <div
            key={`dot-${swatch.hex}-${index}`}
            className="h-6 w-6 rounded-full border border-[#E8DED2]"
            style={{ backgroundColor: swatch.hex }}
            title={swatch.name}
          />
        ))}
      </div>
    </div>
  )
}

function ColorPicker({
  childName,
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
    <div>
      <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
        מה העדפת הצבעים של {childName}?
      </h2>
      <p className="mb-6 text-[#6B6B6B]">
        {theme
          ? `סקלות צבע זמינות לנושא "${theme}"`
          : 'בחר/י את סכמת הצבעים המועדפת'}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {options.map((pref) => {
          const isSelected = value === pref.name
          return (
            <button
              key={pref.scaleId}
              type="button"
              onClick={() => onChange(pref.name)}
              className={`rounded-sm border-2 p-5 text-right transition-all ${
                isSelected
                  ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                  : 'border-[#E8DED2] hover:border-[#D4C4B0]'
              }`}
            >
              <ColorPalettePreview swatches={pref.swatches} selected={isSelected} />
              <h3 className="mb-2 mt-4 text-lg font-normal text-[#4A3728]">{pref.name}</h3>
              {pref.benefit && (
                <p className="text-sm leading-relaxed text-[#6B6B6B]">{pref.benefit}</p>
              )}
            </button>
          )
        })}
      </div>
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
  return (
    <div>
      <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
        איך תרצו לעצב את הקיר המרכזי של {childName}?
      </h2>
      <p className="mb-6 text-[#6B6B6B]">בחר/י את האופציה המתאימה לחדר שלו/ה</p>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onChange('paint')}
          className={`w-full rounded-sm border-2 p-6 text-right transition-all ${
            value === 'paint'
              ? 'border-[#C8B6A6] bg-[#F9F7F4]'
              : 'border-[#E8DED2] hover:border-[#D4C4B0]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-3 inline-block rounded-sm bg-[#F9F7F4] px-4 py-2 text-xl font-normal text-[#4A3728]">
                קיר כוח בצביעה
              </h3>
              <p className="text-sm text-[#6B6B6B]">
                צביעת קיר אחד — עבודה פשוטה של כשעתיים, בסיס על-זמני שמתאים לכל גיל.
              </p>
            </div>
            <Paintbrush className="h-12 w-12 shrink-0 text-[#C8B6A6]" strokeWidth={1.5} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('covering')}
          className={`w-full rounded-sm border-2 p-6 text-right transition-all ${
            value === 'covering'
              ? 'border-[#C8B6A6] bg-[#F9F7F4]'
              : 'border-[#E8DED2] hover:border-[#D4C4B0]'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-3 inline-block rounded-sm bg-[#F9F7F4] px-4 py-2 text-xl font-normal text-[#4A3728]">
                חיפוי קיר דקורטיבי
              </h3>
              <p className="text-sm text-[#6B6B6B]">
                פתרון מעוצב ללא לכלוך של צבע, עם אפשרות להסרה בקלות.
              </p>
            </div>
            <Scroll className="h-12 w-12 shrink-0 text-[#C8B6A6]" strokeWidth={1.5} />
          </div>
        </button>
      </div>
    </div>
  )
}

export function QuestionnairePage() {
  const navigate = useNavigate()
  const { colorScales } = useData()
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

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[#8B8B8B]">
              שלב {step} מתוך {totalSteps}
            </span>
            <span className="text-sm text-[#8B8B8B]">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#F5F1ED]">
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

        <div className="rounded-sm border border-[#E8DED2] bg-white p-8 shadow-sm md:p-12">
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
