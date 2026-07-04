import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { Header } from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { themePackages as staticBasePackages } from '../data/themePackages'
import type { ThemePackage } from '../data/themePackages'
import type { ColorScale } from '../data/colorScales'
import {
  BASE_PACKAGE_IDS,
  buildCatalogVariantId,
  expectedVariantCount,
  hasVariantPackages,
  parseCatalogVariantId,
  parseVariantId,
  resolveCatalogVariant,
  resolveLegacyVariantId,
} from '../utils/packageVariants'
import { filterColorScalesForTheme } from '../data/themeColorScales'
import {
  CATALOG_GENDERS,
  PACKAGE_AGE_GROUPS,
  THEME_CATALOG,
  allCatalogThemeNames,
  type CatalogGender,
  type CatalogTheme,
  type PackageAgeGroupId,
} from '../data/packageCatalog'

const QUESTIONNAIRE_THEMES = allCatalogThemeNames()

function PackageTreeNav({
  packages,
  colorScales,
  selectedId,
  onSelect,
}: {
  packages: ThemePackage[]
  colorScales: ColorScale[]
  selectedId: string | null
  onSelect: (pkg: ThemePackage) => void
}) {
  const [expandedGenders, setExpandedGenders] = useState<Set<CatalogGender>>(() => new Set())
  const [expandedAges, setExpandedAges] = useState<Set<string>>(() => new Set())
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(() => new Set())

  const basePackages = staticBasePackages.filter((pkg) =>
    BASE_PACKAGE_IDS.includes(pkg.id as (typeof BASE_PACKAGE_IDS)[number]),
  )

  const toggle = <T extends string>(key: T, set: React.Dispatch<React.SetStateAction<Set<T>>>) => {
    set((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const ageKey = (gender: CatalogGender, ageId: PackageAgeGroupId) => `${gender}:${ageId}`
  const themeKey = (gender: CatalogGender, ageId: PackageAgeGroupId, themeId: string) =>
    `${gender}:${ageId}:${themeId}`

  const isVariantSaved = (
    theme: CatalogTheme,
    gender: CatalogGender,
    ageId: PackageAgeGroupId,
    scaleId: string,
  ) => {
    const catalogId = buildCatalogVariantId(theme.id, gender, ageId, scaleId)
    if (packages.some((pkg) => pkg.id === catalogId)) return true
    const legacyId = resolveLegacyVariantId(theme, gender, ageId, scaleId)
    return legacyId ? packages.some((pkg) => pkg.id === legacyId) : false
  }

  const isVariantSelected = (
    theme: CatalogTheme,
    gender: CatalogGender,
    ageId: PackageAgeGroupId,
    scaleId: string,
  ) => {
    if (!selectedId) return false
    const catalogId = buildCatalogVariantId(theme.id, gender, ageId, scaleId)
    if (selectedId === catalogId) return true
    const legacyId = resolveLegacyVariantId(theme, gender, ageId, scaleId)
    return legacyId ? selectedId === legacyId : false
  }

  const selectVariant = (
    theme: CatalogTheme,
    gender: CatalogGender,
    ageId: PackageAgeGroupId,
    scale: ColorScale,
  ) => {
    const pkg = resolveCatalogVariant(
      packages,
      basePackages,
      colorScales,
      theme,
      gender,
      ageId,
      scale.id,
    )
    onSelect(pkg)
  }

  return (
    <div className="space-y-1">
      {CATALOG_GENDERS.map(({ id: gender, label: genderLabel }) => {
        const genderOpen = expandedGenders.has(gender)

        return (
          <div key={gender} className="rounded-sm border border-[#E8DED2] bg-white">
            <button
              type="button"
              onClick={() => toggle(gender, setExpandedGenders)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-right text-sm font-normal text-[#4A4A4A] hover:bg-[#F9F7F4]"
            >
              <span>{genderLabel}</span>
              {genderOpen ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-[#B5A99A]" />
              ) : (
                <ChevronLeft className="h-4 w-4 flex-shrink-0 text-[#B5A99A]" />
              )}
            </button>

            {genderOpen &&
              PACKAGE_AGE_GROUPS.map((ageGroup) => {
                const ageId = ageGroup.id
                const aKey = ageKey(gender, ageId)
                const ageOpen = expandedAges.has(aKey)
                const themes = THEME_CATALOG[gender][ageId]

                return (
                  <div key={aKey} className="border-t border-[#F0EBE4]">
                    <button
                      type="button"
                      onClick={() => toggle(aKey, setExpandedAges)}
                      className="flex w-full items-center justify-between px-4 py-2 text-right text-sm text-[#6B6B6B] hover:bg-[#F9F7F4]"
                    >
                      <span>{ageGroup.label}</span>
                      {ageOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-[#B5A99A]" />
                      ) : (
                        <ChevronLeft className="h-3.5 w-3.5 flex-shrink-0 text-[#B5A99A]" />
                      )}
                    </button>

                    {ageOpen && themes.length === 0 && (
                      <p className="border-t border-[#F0EBE4] bg-[#FDFCFB] px-4 py-3 text-xs text-[#B5A99A]">
                        נושאים יתווספו בהמשך
                      </p>
                    )}

                    {ageOpen &&
                      themes.map((theme) => {
                        const tKey = themeKey(gender, ageId, theme.id)
                        const themeOpen = expandedThemes.has(tKey)

                        return (
                          <div key={tKey} className="border-t border-[#F0EBE4]">
                            <button
                              type="button"
                              onClick={() => toggle(tKey, setExpandedThemes)}
                              className="flex w-full items-center justify-between px-5 py-2 text-right text-sm text-[#4A4A4A] hover:bg-[#F9F7F4]"
                            >
                              <span>{theme.name}</span>
                              {themeOpen ? (
                                <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-[#B5A99A]" />
                              ) : (
                                <ChevronLeft className="h-3.5 w-3.5 flex-shrink-0 text-[#B5A99A]" />
                              )}
                            </button>

                            {themeOpen && (
                              <div className="space-y-0.5 border-t border-[#F0EBE4] bg-[#FDFCFB] px-2 py-1">
                                {filterColorScalesForTheme(
                                  colorScales,
                                  gender,
                                  ageId,
                                  theme.id,
                                ).map((scale) => {
                                  const isSelected = isVariantSelected(
                                    theme,
                                    gender,
                                    ageId,
                                    scale.id,
                                  )
                                  const isSaved = isVariantSaved(theme, gender, ageId, scale.id)

                                  return (
                                    <button
                                      key={buildCatalogVariantId(theme.id, gender, ageId, scale.id)}
                                      type="button"
                                      onClick={() => selectVariant(theme, gender, ageId, scale)}
                                      className={`w-full rounded-sm px-3 py-2 text-right text-xs transition-colors ${
                                        isSelected
                                          ? 'bg-[#C8B6A6] text-white'
                                          : 'text-[#6B6B6B] hover:bg-[#F9F7F4]'
                                      }`}
                                    >
                                      <span className="block">{scale.name}</span>
                                      {!isSaved && (
                                        <span
                                          className={`mt-0.5 block text-[10px] ${isSelected ? 'text-white/80' : 'text-[#B5A99A]'}`}
                                        >
                                          טרם נשמר — ברירת מחדל
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )
              })}
          </div>
        )
      })}
    </div>
  )
}

const DEFAULT_PACKAGE_IMAGE = /^\/assets\/packages\/[^/]+-(hero|wall|detail)\.svg$/

function sanitizePackageImages(pkg: ThemePackage): ThemePackage {
  const heroImage = DEFAULT_PACKAGE_IMAGE.test(pkg.heroImage) ? '' : pkg.heroImage
  const galleryImages = pkg.galleryImages.filter((url) => url && !DEFAULT_PACKAGE_IMAGE.test(url))
  return { ...pkg, heroImage, galleryImages }
}

function emptyScale(): ColorScale {
  return {
    id: '',
    name: '',
    questionnaireKeywords: [],
    colors: [{ roleLabel: 'גוון בסיס — קיר', name: '', hex: '#C8B6A6' }],
  }
}

const inputClass =
  'w-full rounded-sm border border-[#E8DED2] bg-[#F9F7F4] px-3 py-2 text-sm focus:ring-2 focus:ring-[#C8B6A6] focus:outline-none'
const labelClass = 'mb-1 block text-xs font-normal text-[#6B6B6B]'
const cardClass = 'rounded-sm border border-[#E8DED2] bg-white p-5 shadow-sm'

function ImageField({
  value,
  onChange,
  onUpload,
  label,
  hint,
  size = 'sm',
  urlPlaceholder = 'כתובת תמונה או העלי קובץ',
}: {
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<string>
  label?: string
  hint?: string
  size?: 'sm' | 'lg'
  urlPlaceholder?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const previewSize = size === 'lg' ? 'h-32 w-full' : 'h-14 w-14 flex-shrink-0'

  const handleFile = async (file: File) => {
    setBusy(true)
    try {
      const url = await onUpload(file)
      onChange(url)
    } catch {
      alert('העלאת התמונה נכשלה')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className={labelClass}>{label}</label>}
      {hint && <p className="text-xs leading-relaxed text-[#8B8B8B]">{hint}</p>}
      {size === 'lg' && value ? (
        <div className={`relative overflow-hidden rounded-sm border border-[#E8DED2] ${previewSize}`}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white opacity-0 transition-opacity hover:opacity-100 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : 'החלפת תמונה'}
          </button>
        </div>
      ) : size === 'lg' ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className={`flex ${previewSize} flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-[#E8DED2] bg-[#F9F7F4] text-sm text-[#B5A99A] transition-colors hover:border-[#C8B6A6] hover:text-[#8B7340] disabled:opacity-50`}
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          העלאת תמונה
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {value ? (
            <img
              src={value}
              alt=""
              className={`${previewSize} rounded-sm border border-[#E8DED2] object-cover`}
            />
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm border border-dashed border-[#E8DED2] text-[10px] text-[#B5A99A]">
              אין
            </div>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={urlPlaceholder}
            dir="ltr"
            className={`${inputClass} text-left`}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex flex-shrink-0 items-center gap-1 rounded-sm border border-[#C8B6A6] px-3 py-2 text-sm text-[#8B7340] transition-colors hover:bg-[#FFF9E6] disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </button>
        </div>
      )}
      {size === 'lg' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="או הדביקי כתובת תמונה קיימת"
          dir="ltr"
          className={`${inputClass} text-left text-xs`}
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function PackageImagesEditor({
  draft,
  update,
  onUpload,
}: {
  draft: ThemePackage
  update: (partial: Partial<ThemePackage>) => void
  onUpload: (file: File) => Promise<string>
}) {
  return (
    <div className={cardClass}>
      <h3 className="mb-1 text-lg font-normal text-[#4A4A4A]">תמונות עיצוב החבילה</h3>
      <p className="mb-5 text-sm leading-relaxed text-[#6B6B6B]">
        תמונות כלליות של החבילה — הדמיות, קירות, ותצוגות עיצוב שמוצגות ללקוחה בדף החבילה.
        זה נפרד מתמונות המוצרים ברשימת הקניות.
      </p>

      <ImageField
        label="תמונה ראשית"
        hint="מוצגת בגודל גדול בראש דף החבילה"
        size="lg"
        value={draft.heroImage}
        onChange={(url) => update({ heroImage: url })}
        onUpload={onUpload}
      />

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <label className={labelClass}>גלריית עיצוב</label>
            <p className="text-xs text-[#8B8B8B]">תמונות נוספות — פינות חדר, פרטים, השראה</p>
          </div>
          <button
            type="button"
            onClick={() => update({ galleryImages: [...draft.galleryImages, ''] })}
            className="flex items-center gap-1 text-sm text-[#C8B6A6] hover:underline"
          >
            <Plus className="h-4 w-4" /> תמונה
          </button>
        </div>

        {draft.galleryImages.length === 0 ? (
          <p className="rounded-sm border border-dashed border-[#E8DED2] bg-[#F9F7F4] px-4 py-6 text-center text-sm text-[#B5A99A]">
            אין תמונות בגלריה — לחצי &quot;תמונה&quot; להוספה
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {draft.galleryImages.map((image, index) => (
              <div key={index} className="relative rounded-sm border border-[#E8DED2] bg-[#F9F7F4] p-3">
                <button
                  type="button"
                  onClick={() =>
                    update({ galleryImages: draft.galleryImages.filter((_, i) => i !== index) })
                  }
                  className="absolute top-2 left-2 z-10 rounded-sm bg-white/90 p-1 text-[#B5A99A] shadow-sm hover:text-[#A05A5A]"
                  aria-label="הסרת תמונה"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <ImageField
                  size="lg"
                  value={image}
                  onChange={(url) => {
                    const next = [...draft.galleryImages]
                    next[index] = url
                    update({ galleryImages: next })
                  }}
                  onUpload={onUpload}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PackageEditor({
  draft,
  setDraft,
  isNew,
  onSave,
  onDelete,
  onUploadPackageImage,
  onUploadProductImage,
  saving,
}: {
  draft: ThemePackage
  setDraft: (pkg: ThemePackage) => void
  isNew: boolean
  onSave: () => void
  onDelete: () => void
  onUploadPackageImage: (file: File) => Promise<string>
  onUploadProductImage: (file: File) => Promise<string>
  saving: boolean
}) {
  const update = (partial: Partial<ThemePackage>) => setDraft({ ...draft, ...partial })

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <h3 className="mb-4 text-lg font-normal text-[#4A4A4A]">פרטי חבילה</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>מזהה (id)</label>
            <input
              type="text"
              value={draft.id}
              onChange={(e) => update({ id: e.target.value.trim() })}
              disabled={!isNew}
              dir="ltr"
              className={`${inputClass} text-left disabled:opacity-60`}
            />
          </div>
          <div>
            <label className={labelClass}>שם החבילה</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>נושא (תצוגה)</label>
            <input
              type="text"
              value={draft.theme}
              onChange={(e) => update({ theme: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>נושא בשאלון (קובע איזו חבילה מקבלים)</label>
            <select
              value={draft.questionnaireTheme}
              onChange={(e) => update({ questionnaireTheme: e.target.value })}
              className={inputClass}
            >
              {QUESTIONNAIRE_THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
              {!QUESTIONNAIRE_THEMES.includes(draft.questionnaireTheme) && (
                <option value={draft.questionnaireTheme}>{draft.questionnaireTheme}</option>
              )}
            </select>
          </div>
          <div>
            <label className={labelClass}>מחיר (₪)</label>
            <input
              type="number"
              value={draft.price}
              onChange={(e) => update({ price: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>מין</label>
            <select
              value={draft.gender}
              onChange={(e) => update({ gender: e.target.value as ThemePackage['gender'] })}
              className={inputClass}
            >
              <option value="unisex">יוניסקס</option>
              <option value="boy">בנים</option>
              <option value="girl">בנות</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>גיל מינימלי</label>
            <input
              type="number"
              value={draft.ageRange[0]}
              onChange={(e) => update({ ageRange: [Number(e.target.value), draft.ageRange[1]] })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>גיל מקסימלי</label>
            <input
              type="number"
              value={draft.ageRange[1]}
              onChange={(e) => update({ ageRange: [draft.ageRange[0], Number(e.target.value)] })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>תיאור</label>
          <textarea
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-normal text-[#4A4A4A]">פלטת צבעים</h3>
          <button
            type="button"
            onClick={() => update({ colorPalette: [...draft.colorPalette, '#CCCCCC'] })}
            className="flex items-center gap-1 text-sm text-[#C8B6A6] hover:underline"
          >
            <Plus className="h-4 w-4" /> צבע
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {draft.colorPalette.map((color, index) => (
            <div key={index} className="flex flex-col items-center gap-1">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const next = [...draft.colorPalette]
                  next[index] = e.target.value
                  update({ colorPalette: next })
                }}
                className="h-10 w-10 cursor-pointer rounded-full border border-[#E8DED2]"
              />
              <button
                type="button"
                onClick={() =>
                  update({ colorPalette: draft.colorPalette.filter((_, i) => i !== index) })
                }
                className="text-[#B5A99A] hover:text-[#A05A5A]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <PackageImagesEditor draft={draft} update={update} onUpload={onUploadPackageImage} />

      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-normal text-[#4A4A4A]">רשימת קניות וקישורים</h3>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              מוצרים לרכישה — כל פריט כולל קישור ותמונת מוצר קטנה (נפרד מתמונות העיצוב למעלה)
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              update({
                shoppingCategories: [
                  ...draft.shoppingCategories,
                  { category: 'קטגוריה חדשה', items: [] },
                ],
              })
            }
            className="flex flex-shrink-0 items-center gap-1 text-sm text-[#C8B6A6] hover:underline"
          >
            <Plus className="h-4 w-4" /> קטגוריה
          </button>
        </div>

        <div className="space-y-5">
          {draft.shoppingCategories.map((category, catIndex) => (
            <div key={catIndex} className="rounded-sm border border-[#E8DED2] p-4">
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="text"
                  value={category.category}
                  onChange={(e) => {
                    const next = [...draft.shoppingCategories]
                    next[catIndex] = { ...category, category: e.target.value }
                    update({ shoppingCategories: next })
                  }}
                  className={`${inputClass} font-normal`}
                />
                <button
                  type="button"
                  onClick={() =>
                    update({
                      shoppingCategories: draft.shoppingCategories.filter((_, i) => i !== catIndex),
                    })
                  }
                  className="flex-shrink-0 text-[#B5A99A] hover:text-[#A05A5A]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {category.items.map((item, itemIndex) => {
                  const updateItem = (partial: Partial<typeof item>) => {
                    const next = [...draft.shoppingCategories]
                    const items = [...category.items]
                    items[itemIndex] = { ...item, ...partial }
                    next[catIndex] = { ...category, items }
                    update({ shoppingCategories: next })
                  }
                  return (
                    <div key={itemIndex} className="rounded-sm bg-[#F9F7F4] p-3">
                      <div className="mb-2 flex items-start gap-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem({ name: e.target.value })}
                            placeholder="שם הפריט"
                            className={inputClass}
                          />
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => updateItem({ link: e.target.value })}
                            placeholder="קישור קנייה"
                            dir="ltr"
                            className={`${inputClass} text-left`}
                          />
                          <input
                            type="text"
                            value={item.notes ?? ''}
                            onChange={(e) => updateItem({ notes: e.target.value })}
                            placeholder="הערות"
                            className={inputClass}
                          />
                          <ImageField
                            label="תמונת מוצר"
                            hint="תמונה קטנה לרשימת הקניות — לא תמונת עיצוב החבילה"
                            value={item.image}
                            onChange={(url) => updateItem({ image: url })}
                            onUpload={onUploadProductImage}
                            urlPlaceholder="קישור לתמונת המוצר"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...draft.shoppingCategories]
                            next[catIndex] = {
                              ...category,
                              items: category.items.filter((_, i) => i !== itemIndex),
                            }
                            update({ shoppingCategories: next })
                          }}
                          className="flex-shrink-0 text-[#B5A99A] hover:text-[#A05A5A]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                <button
                  type="button"
                  onClick={() => {
                    const next = [...draft.shoppingCategories]
                    next[catIndex] = {
                      ...category,
                      items: [
                        ...category.items,
                        { name: '', link: '', notes: '', image: '/assets/packages/item-decor.svg' },
                      ],
                    }
                    update({ shoppingCategories: next })
                  }}
                  className="flex items-center gap-1 text-sm text-[#C8B6A6] hover:underline"
                >
                  <Plus className="h-4 w-4" /> פריט
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !draft.id || !draft.name}
          className="flex items-center gap-2 rounded-sm bg-[#C8B6A6] px-6 py-2.5 text-white transition-colors hover:bg-[#B5A99A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          שמירה
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-sm border border-[#E8C5C5] px-6 py-2.5 text-[#A05A5A] transition-colors hover:bg-[#FCF0F0]"
          >
            <Trash2 className="h-4 w-4" />
            מחיקה
          </button>
        )}
      </div>
    </div>
  )
}

function ColorScaleEditor({
  draft,
  setDraft,
  isNew,
  onSave,
  onDelete,
  saving,
}: {
  draft: ColorScale
  setDraft: (scale: ColorScale) => void
  isNew: boolean
  onSave: () => void
  onDelete: () => void
  saving: boolean
}) {
  const update = (partial: Partial<ColorScale>) => setDraft({ ...draft, ...partial })

  return (
    <div className="space-y-5">
      <div className={cardClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>מזהה (id)</label>
            <input
              type="text"
              value={draft.id}
              onChange={(e) => update({ id: e.target.value.trim() })}
              disabled={!isNew}
              dir="ltr"
              className={`${inputClass} text-left disabled:opacity-60`}
            />
          </div>
          <div>
            <label className={labelClass}>שם הסקלה</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>
            מילות מפתח מהשאלון (מופרדות בפסיק — קובעות אילו צבעים מקבלים לכל בחירה)
          </label>
          <input
            type="text"
            value={draft.questionnaireKeywords.join(', ')}
            onChange={(e) =>
              update({
                questionnaireKeywords: e.target.value
                  .split(',')
                  .map((keyword) => keyword.trim())
                  .filter(Boolean),
              })
            }
            placeholder="חמים, כחול"
            className={inputClass}
          />
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-normal text-[#4A4A4A]">גוונים</h3>
          <button
            type="button"
            onClick={() =>
              update({ colors: [...draft.colors, { roleLabel: 'גוון תומך', name: '', hex: '#CCCCCC' }] })
            }
            className="flex items-center gap-1 text-sm text-[#C8B6A6] hover:underline"
          >
            <Plus className="h-4 w-4" /> גוון
          </button>
        </div>
        <div className="space-y-3">
          {draft.colors.map((color, index) => {
            const updateColor = (partial: Partial<typeof color>) => {
              const next = [...draft.colors]
              next[index] = { ...color, ...partial }
              update({ colors: next })
            }
            return (
              <div key={index} className="flex items-center gap-2 rounded-sm bg-[#F9F7F4] p-3">
                <input
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateColor({ hex: e.target.value })}
                  className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-full border border-[#E8DED2]"
                />
                <input
                  type="text"
                  value={color.roleLabel}
                  onChange={(e) => updateColor({ roleLabel: e.target.value })}
                  placeholder="תפקיד (בסיס/תומך/דגש)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => updateColor({ name: e.target.value })}
                  placeholder="שם הגוון"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={color.code ?? ''}
                  onChange={(e) => updateColor({ code: e.target.value })}
                  placeholder="קוד"
                  dir="ltr"
                  className={`${inputClass} text-left`}
                />
                <button
                  type="button"
                  onClick={() => update({ colors: draft.colors.filter((_, i) => i !== index) })}
                  className="flex-shrink-0 text-[#B5A99A] hover:text-[#A05A5A]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !draft.id || !draft.name}
          className="flex items-center gap-2 rounded-sm bg-[#C8B6A6] px-6 py-2.5 text-white transition-colors hover:bg-[#B5A99A] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          שמירה
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-2 rounded-sm border border-[#E8C5C5] px-6 py-2.5 text-[#A05A5A] transition-colors hover:bg-[#FCF0F0]"
          >
            <Trash2 className="h-4 w-4" />
            מחיקה
          </button>
        )}
      </div>
    </div>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const {
    packages,
    colorScales,
    loading,
    persisted,
    savePackage,
    deletePackage,
    saveColorScale,
    deleteColorScale,
    seedFromStatic,
    uploadImage,
  } = useData()

  const [tab, setTab] = useState<'packages' | 'colors'>('packages')
  const [packageDraft, setPackageDraft] = useState<ThemePackage | null>(null)
  const [scaleDraft, setScaleDraft] = useState<ColorScale | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const seedAttemptedRef = useRef(false)
  const packagesRef = useRef(packages)
  const colorScalesRef = useRef(colorScales)
  packagesRef.current = packages
  colorScalesRef.current = colorScales

  useEffect(() => {
    const currentPackages = packagesRef.current
    const currentScales = colorScalesRef.current
    const needsVariants =
      !hasVariantPackages(currentPackages) ||
      currentPackages.length < expectedVariantCount(currentScales.length)

    if (
      user?.isAdmin &&
      !loading &&
      (!persisted || needsVariants) &&
      !seeding &&
      !seedAttemptedRef.current
    ) {
      seedAttemptedRef.current = true
      setSeeding(true)
      seedFromStatic()
        .catch(() => {
          seedAttemptedRef.current = false
        })
        .finally(() => setSeeding(false))
    }
  }, [user, loading, persisted, seeding, seedFromStatic])

  const handleSavePackage = async () => {
    if (!packageDraft) return
    if (isNew && packages.some((p) => p.id === packageDraft.id)) {
      alert('כבר קיימת חבילה עם המזהה הזה')
      return
    }
    setSaving(true)
    try {
      await savePackage(packageDraft)
      setPackageDraft(null)
      setIsNew(false)
    } catch {
      alert('שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!packageDraft) return
    if (!confirm(`למחוק את החבילה "${packageDraft.name}"?`)) return
    setSaving(true)
    try {
      await deletePackage(packageDraft.id)
      setPackageDraft(null)
    } catch {
      alert('מחיקה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveScale = async () => {
    if (!scaleDraft) return
    if (isNew && colorScales.some((s) => s.id === scaleDraft.id)) {
      alert('כבר קיימת סקלה עם המזהה הזה')
      return
    }
    setSaving(true)
    try {
      await saveColorScale(scaleDraft)
      setScaleDraft(null)
      setIsNew(false)
    } catch {
      alert('שמירה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteScale = async () => {
    if (!scaleDraft) return
    if (!confirm(`למחוק את הסקלה "${scaleDraft.name}"?`)) return
    setSaving(true)
    try {
      await deleteColorScale(scaleDraft.id)
      setScaleDraft(null)
    } catch {
      alert('מחיקה נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-light text-[#4A4A4A]">לוח ניהול</h1>
          <p className="text-[#6B6B6B]">
            ניהול חבילות, נושאים, צבעים, קישורים ותמונות. השינויים נשמרים ומשפיעים על האתר מיד.
          </p>
          {seeding && (
            <p className="mt-2 flex items-center gap-2 text-sm text-[#8B7340]">
              <Loader2 className="h-4 w-4 animate-spin" /> טוען נתונים ראשוניים...
            </p>
          )}
        </div>

        <div className="mb-6 flex gap-2 border-b border-[#E8DED2]">
          <button
            type="button"
            onClick={() => {
              setTab('packages')
              setScaleDraft(null)
            }}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === 'packages'
                ? 'border-b-2 border-[#C8B6A6] text-[#4A4A4A]'
                : 'text-[#8B8B8B] hover:text-[#4A4A4A]'
            }`}
          >
            חבילות (
            {packages.filter((p) => parseCatalogVariantId(p.id) || parseVariantId(p.id)).length ||
              packages.length}
            )
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('colors')
              setPackageDraft(null)
            }}
            className={`px-4 py-2 text-sm transition-colors ${
              tab === 'colors'
                ? 'border-b-2 border-[#C8B6A6] text-[#4A4A4A]'
                : 'text-[#8B8B8B] hover:text-[#4A4A4A]'
            }`}
          >
            סקלות צבעים ({colorScales.length})
          </button>
        </div>

        {tab === 'packages' && (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <div className="space-y-3">
              <p className="text-xs leading-relaxed text-[#8B8B8B]">
                מין ← גיל ← נושא ← סקלת צבעים. בחרי וריאנט לעריכה — וריאנטים שלא נשמרו מוצגים כברירת
                מחדל.
              </p>
              <PackageTreeNav
                packages={packages}
                colorScales={colorScales}
                selectedId={packageDraft?.id ?? null}
                onSelect={(pkg) => {
                  setPackageDraft(sanitizePackageImages(structuredClone(pkg)))
                  setIsNew(!packages.some((p) => p.id === pkg.id))
                }}
              />
            </div>

            <div>
              {packageDraft ? (
                <PackageEditor
                  draft={packageDraft}
                  setDraft={setPackageDraft}
                  isNew={isNew}
                  onSave={handleSavePackage}
                  onDelete={handleDeletePackage}
                  onUploadPackageImage={(file) => uploadImage(file, 'package-gallery')}
                  onUploadProductImage={(file) => uploadImage(file, 'product')}
                  saving={saving}
                />
              ) : (
                <div className="rounded-sm border border-dashed border-[#E8DED2] p-12 text-center text-[#8B8B8B]">
                  בחרי חבילה לעריכה או צרי חבילה חדשה
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'colors' && (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setScaleDraft(emptyScale())
                  setIsNew(true)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#C8B6A6] px-4 py-2.5 text-white transition-colors hover:bg-[#B5A99A]"
              >
                <Plus className="h-4 w-4" /> סקלה חדשה
              </button>
              {colorScales.map((scale) => (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => {
                    setScaleDraft(structuredClone(scale))
                    setIsNew(false)
                  }}
                  className={`w-full rounded-sm border px-4 py-3 text-right transition-colors ${
                    scaleDraft?.id === scale.id && !isNew
                      ? 'border-[#C8B6A6] bg-[#F9F7F4]'
                      : 'border-[#E8DED2] bg-white hover:bg-[#F9F7F4]'
                  }`}
                >
                  <p className="text-sm font-normal text-[#4A4A4A]">{scale.name || scale.id}</p>
                  <div className="mt-1 flex gap-1">
                    {scale.colors.slice(0, 6).map((color, index) => (
                      <span
                        key={index}
                        className="h-3 w-3 rounded-full border border-[#E8DED2]"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div>
              {scaleDraft ? (
                <ColorScaleEditor
                  draft={scaleDraft}
                  setDraft={setScaleDraft}
                  isNew={isNew}
                  onSave={handleSaveScale}
                  onDelete={handleDeleteScale}
                  saving={saving}
                />
              ) : (
                <div className="rounded-sm border border-dashed border-[#E8DED2] p-12 text-center text-[#8B8B8B]">
                  בחרי סקלה לעריכה או צרי סקלה חדשה
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
