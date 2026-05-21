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

interface AdditionalChild {
  name: string
  age: number
  gender: 'boy' | 'girl' | 'unisex' | ''
  theme: string
  colorPreference: string
}

interface FormData {
  childName: string
  gender: 'boy' | 'girl' | 'unisex' | ''
  age: string
  theme: string
  colorPreference: string
  wallDesignOption: string
  additionalChildren: AdditionalChild[]
}

const themes = [
  'מסע בחלל',
  "גיבורי על ג'וניור",
  'עולם הדינוזאורים',
  'חוקר טבע קטן',
]

const colorPreferences = [
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

export function QuestionnairePage() {
  const navigate = useNavigate()
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

  const totalSteps = 4 + 2 * (1 + formData.additionalChildren.length)

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

    const childStepStart = 7
    if (step >= childStepStart) {
      const additionalChildIndex = Math.floor((step - childStepStart) / 2)
      const isThemeStep = (step - childStepStart) % 2 === 0
      if (additionalChildIndex < formData.additionalChildren.length) {
        if (isThemeStep) {
          return formData.additionalChildren[additionalChildIndex].theme !== ''
        }
        return formData.additionalChildren[additionalChildIndex].colorPreference !== ''
      }
    }
    return false
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
    setFormData({
      ...formData,
      additionalChildren: formData.additionalChildren.filter((_, i) => i !== index),
    })
  }

  const genderOptions = [
    { value: 'boy' as const, label: 'בן', icon: 'user' },
    { value: 'girl' as const, label: 'בת', icon: 'girl' },
    { value: 'unisex' as const, label: 'ניטרלי', icon: 'users' },
  ]

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
                    onClick={() => setFormData({ ...formData, gender: option.value })}
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

              <div className="mb-8">
                <div className="mb-6 text-center">
                  <span className="text-5xl font-light text-[#C8B6A6]">{formData.age}</span>
                  <span className="mr-2 text-2xl text-[#8B8B8B]">שנים</span>
                </div>
                <Slider
                  value={[parseInt(formData.age, 10)]}
                  onValueChange={(value) =>
                    setFormData({ ...formData, age: value[0].toString() })
                  }
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
                  הוסיפו אח או אחות וקבלו 20% הנחה על כל חבילה נוספת!
                </p>

                {formData.additionalChildren.map((child, index) => (
                  <div
                    key={index}
                    className="mb-2 flex items-center justify-between rounded-sm bg-[#F9F7F4] p-4"
                  >
                    <span className="text-[#4A4A4A]">
                      {child.name} ({child.age} שנים) -{' '}
                      {child.gender === 'boy'
                        ? 'בן'
                        : child.gender === 'girl'
                          ? 'בת'
                          : 'ניטרלי'}
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
                    <div>
                      <label className="mb-2 block text-sm text-[#6B6B6B]">גיל</label>
                      <div className="mb-2 text-center">
                        <span className="text-2xl font-light text-[#C8B6A6]">{newChildAge}</span>
                        <span className="mr-2 text-lg text-[#8B8B8B]">שנים</span>
                      </div>
                      <Slider
                        value={[newChildAge]}
                        onValueChange={(value) => setNewChildAge(value[0])}
                        min={1}
                        max={12}
                        step={1}
                      />
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

          {step === 4 && (
            <div>
              <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                איזה נושא {formData.childName}{' '}
                {formData.gender === 'boy'
                  ? 'אוהב'
                  : formData.gender === 'girl'
                    ? 'אוהבת'
                    : 'אוהב/ת'}
                ?
              </h2>
              <p className="mb-6 text-[#6B6B6B]">בחר/י נושא או תחום עניין מועדף</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {themes.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme })}
                    className={`rounded-sm border-2 p-4 text-center transition-all ${
                      formData.theme === theme
                        ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                        : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                מה העדפת הצבעים של {formData.childName}?
              </h2>
              <p className="mb-6 text-[#6B6B6B]">בחר/י את סכמת הצבעים המועדפת</p>
              <div className="grid gap-4 md:grid-cols-2">
                {colorPreferences.map((pref) => (
                  <button
                    key={pref.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, colorPreference: pref.name })}
                    className={`rounded-sm border-2 p-5 text-right transition-all ${
                      formData.colorPreference === pref.name
                        ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                        : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                    }`}
                  >
                    <div className="mb-3 flex gap-2">
                      {pref.colors.map((color) => (
                        <div
                          key={color}
                          className="h-8 w-8 rounded-full border border-[#E8DED2]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h3 className="mb-2 text-lg font-normal text-[#4A3728]">{pref.name}</h3>
                    <p className="text-sm leading-relaxed text-[#6B6B6B]">{pref.benefit}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                איך תרצו לעצב את הקיר המרכזי?
              </h2>
              <p className="mb-6 text-[#6B6B6B]">בחר/י את האופציה המתאימה עבורך</p>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, wallDesignOption: 'paint' })}
                  className={`w-full rounded-sm border-2 p-6 text-right transition-all ${
                    formData.wallDesignOption === 'paint'
                      ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                      : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-3 inline-block rounded-sm bg-[#F9F7F4] px-4 py-2 text-xl font-normal text-[#4A3728]">
                        קיר כוח בצביעה
                      </h3>
                      <p className="mb-2 text-sm text-[#6B6B6B]">
                        <strong className="text-[#4A3728]">קהל יעד:</strong> בעלי דירה או שוכרים
                        לטווח ארוך שמחפשים מראה עמוק, יוקרתי ומשתלם.
                      </p>
                      <p className="mb-2 text-sm text-[#6B6B6B]">
                        <strong className="text-[#4A3728]">פרקטיקה:</strong> צביעת קיר אחד היא
                        עבודה פשוטה של כשעתיים.
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        <strong className="text-[#4A3728]">יתרון עתידי:</strong> בסיס על-זמני
                        שמתאים לכל גיל.
                      </p>
                    </div>
                    <Paintbrush className="h-12 w-12 shrink-0 text-[#C8B6A6]" strokeWidth={1.5} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, wallDesignOption: 'covering' })}
                  className={`w-full rounded-sm border-2 p-6 text-right transition-all ${
                    formData.wallDesignOption === 'covering'
                      ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                      : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="mb-3 inline-block rounded-sm bg-[#F9F7F4] px-4 py-2 text-xl font-normal text-[#4A3728]">
                        חיפוי קיר דקורטיבי
                      </h3>
                      <p className="mb-2 text-sm text-[#6B6B6B]">
                        <strong className="text-[#4A3728]">קהל יעד:</strong> דירות שכורות או למי
                        שרוצה פתרון מעוצב ללא לכלוך של צבע.
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        <strong className="text-[#4A3728]">היתרון הגדול:</strong> ניתן להסרה
                        בקלות כשרוצים לשדרג או לעבור דירה.
                      </p>
                    </div>
                    <Scroll className="h-12 w-12 shrink-0 text-[#C8B6A6]" strokeWidth={1.5} />
                  </div>
                </button>
              </div>

              <div className="mt-6 rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-5">
                <p className="text-sm leading-relaxed text-[#4A3728]">
                  <strong>טיפ מהמעצבת:</strong> אם אתם מחפשים את הפתרון המשלם והמרשים ביותר
                  לאורך שנים – לכו על צבע. אם אתם בשכירות – החיפוי הדקורטיבי הוא הפתרון המומלץ.
                </p>
              </div>
            </div>
          )}

          {step >= 7 &&
            (() => {
              const childStepStart = 7
              const additionalChildIndex = Math.floor((step - childStepStart) / 2)
              const isThemeStep = (step - childStepStart) % 2 === 0

              if (additionalChildIndex >= formData.additionalChildren.length) return null

              const child = formData.additionalChildren[additionalChildIndex]

              if (isThemeStep) {
                return (
                  <div>
                    <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                      איזה נושא {child.name} אוהב/ת?
                    </h2>
                    <p className="mb-6 text-[#6B6B6B]">בחר/י נושא או תחום עניין מועדף</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {themes.map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => {
                            const updated = [...formData.additionalChildren]
                            updated[additionalChildIndex] = { ...updated[additionalChildIndex], theme }
                            setFormData({ ...formData, additionalChildren: updated })
                          }}
                          className={`rounded-sm border-2 p-4 text-center transition-all ${
                            child.theme === theme
                              ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                              : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <div>
                  <h2 className="mb-4 text-3xl font-light text-[#4A4A4A]">
                    מה העדפת הצבעים של {child.name}?
                  </h2>
                  <p className="mb-6 text-[#6B6B6B]">בחר/י את סכמת הצבעים המועדפת</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {colorPreferences.map((pref) => (
                      <button
                        key={pref.name}
                        type="button"
                        onClick={() => {
                          const updated = [...formData.additionalChildren]
                          updated[additionalChildIndex] = {
                            ...updated[additionalChildIndex],
                            colorPreference: pref.name,
                          }
                          setFormData({ ...formData, additionalChildren: updated })
                        }}
                        className={`rounded-sm border-2 p-5 text-right transition-all ${
                          child.colorPreference === pref.name
                            ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                            : 'border-[#E8DED2] hover:border-[#D4C4B0]'
                        }`}
                      >
                        <div className="mb-3 flex gap-2">
                          {pref.colors.map((color) => (
                            <div
                              key={color}
                              className="h-8 w-8 rounded-full border border-[#E8DED2]"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <h3 className="mb-2 text-lg font-normal text-[#4A3728]">{pref.name}</h3>
                        <p className="text-sm leading-relaxed text-[#6B6B6B]">{pref.benefit}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })()}

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
