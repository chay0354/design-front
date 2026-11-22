import type { PackageContent } from '../contexts/DataContext'
import type { ThemePackage } from '../data/themePackages'
import { getChildPackageEntries, getYearsSincePurchase, type ChildInfo, type ChildPackageEntry, type User } from './auth'
import { formatRoomNames } from './questionnaire'

export interface RoomKid {
  name: string
  age: number
  gender: string
}

/** One room in the personal area: its children, the package it has now, and the packages it had before. */
export interface AccountRoom {
  key: string
  roomId?: string
  kids: RoomKid[]
  /** "אייר וטל" */
  names: string
  pkg: ThemePackage
  entry: ChildInfo
  archived: ChildPackageEntry[]
}

export function roomKey(child: ChildInfo): string {
  return child.roomId || `${child.name}|${child.packageId}|${child.purchaseDate}`
}

/** Purchases made before the room model stored one child per entry. */
export function roomKids(child: ChildInfo): RoomKid[] {
  if (child.roomChildren?.length) return child.roomChildren
  return [{ name: child.name, age: child.age, gender: child.gender || '' }]
}

export function kidAgeToday(kid: RoomKid, purchaseDate: string): number {
  return Math.floor(kid.age + getYearsSincePurchase(purchaseDate))
}

export function getAccountRooms(
  user: User,
  packages: ThemePackage[],
  getPackageById: (id: string) => ThemePackage | undefined,
): AccountRoom[] {
  const entries = getChildPackageEntries(user, packages, getPackageById)
  const archived = entries.filter((entry) => entry.child.archivedAt)
  return entries
    .filter((entry) => !entry.child.archivedAt)
    .map(({ child, pkg }) => {
      const kids = roomKids(child)
      return {
        key: roomKey(child),
        roomId: child.roomId,
        kids,
        names: formatRoomNames(kids),
        pkg,
        entry: child,
        archived: child.roomId
          ? archived
              .filter((old) => old.child.roomId === child.roomId)
              .sort((a, b) => b.child.purchaseDate.localeCompare(a.child.purchaseDate))
          : [],
      }
    })
}

export function packageThemeName(room: Pick<AccountRoom, 'entry' | 'pkg'>): string {
  return room.entry.theme || room.pkg.name
}

export function packagePath(room: Pick<AccountRoom, 'key' | 'pkg'>): string {
  return `/package/${room.pkg.id}?room=${encodeURIComponent(room.key)}`
}

export const FALLBACK_ROOM_IMAGE = '/assets/hero-background.jpg'

export function packagePreviewImage(content: PackageContent | null): string {
  if (!content) return FALLBACK_ROOM_IMAGE
  return content.heroImage || content.galleryImages.find(Boolean) || FALLBACK_ROOM_IMAGE
}

/** Hebrew pronoun for the room's children: "לו" / "לה" / "להם". */
export function kidsPronoun(kids: RoomKid[], forms: { boy: string; girl: string; many: string }): string {
  if (kids.length !== 1) return forms.many
  return kids[0].gender === 'girl' ? forms.girl : forms.boy
}

export function ageRangeLabel(pkg: ThemePackage): string {
  const [min, max] = pkg.ageRange
  return `${min}–${max}`
}

/** "New design for this room": the questionnaire starts with these rooms' children. */
export function redesignPath(roomIds: string[]): string {
  const ids = roomIds.filter(Boolean)
  return ids.length ? `/questionnaire?roomId=${ids.map(encodeURIComponent).join(',')}` : '/questionnaire'
}
