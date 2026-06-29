import { isBasePackageId, parseVariantId } from './packageVariants'
import type { ThemePackage } from '../data/themePackages'

export interface PurchaseOrder {
  packageId: string
  childName: string
  childAge: number
  gender?: string
  theme?: string
  colorPreference?: string
}

export interface ChildInfo {
  name: string
  age: number
  packageId: string
  purchaseDate: string
  gender?: string
  theme?: string
  colorPreference?: string
}

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  purchasedPackages: string[]
  children: ChildInfo[]
}

function matchesPackageId(storedId: string, packageId: string): boolean {
  if (storedId === packageId) return true

  if (isBasePackageId(packageId)) {
    return storedId.startsWith(`${packageId}-`)
  }

  const baseId = parseVariantId(packageId)?.baseId
  if (baseId && storedId === baseId) return true

  return false
}

export function hasPurchased(user: User | null, packageId: string): boolean {
  if (!user) return false
  if (user.purchasedPackages.some((storedId) => matchesPackageId(storedId, packageId))) {
    return true
  }
  return user.children.some((child) => matchesPackageId(child.packageId, packageId))
}

export function getChildForPackage(user: User | null, packageId: string): ChildInfo | undefined {
  return user?.children.find((child) => matchesPackageId(child.packageId, packageId))
}

export function getChildrenForPackage(user: User | null, packageId: string): ChildInfo[] {
  return user?.children.filter((child) => matchesPackageId(child.packageId, packageId)) || []
}

export function findPackageForChild(
  packages: ThemePackage[],
  getPackageById: (id: string) => ThemePackage | undefined,
  childPackageId: string,
): ThemePackage | undefined {
  const direct = getPackageById(childPackageId)
  if (direct) return direct
  return packages.find((pkg) => matchesPackageId(childPackageId, pkg.id))
}

export interface ChildPackageEntry {
  child: ChildInfo
  pkg: ThemePackage
}

/** One card per child purchase — siblings with the same package id each get their own entry. */
export function getChildPackageEntries(
  user: User,
  packages: ThemePackage[],
  getPackageById: (id: string) => ThemePackage | undefined,
): ChildPackageEntry[] {
  return user.children.flatMap((child) => {
    const pkg = findPackageForChild(packages, getPackageById, child.packageId)
    if (!pkg) return []
    return [{ child, pkg }]
  })
}

export function getPackageStatusForChild(
  pkg: ThemePackage,
  child: ChildInfo,
): { status: 'active' | 'expiring' | 'outdated'; message: string } {
  const yearsSincePurchase = getYearsSincePurchase(child.purchaseDate)
  const currentChildAge = child.age + yearsSincePurchase

  if (currentChildAge > pkg.ageRange[1]) {
    return {
      status: 'outdated',
      message: `${child.name} גדל/ה מחבילה זו (כעת בגיל ${Math.floor(currentChildAge)})`,
    }
  }

  if (currentChildAge > pkg.ageRange[1] - 1) {
    return {
      status: 'expiring',
      message: `${child.name} עומד/ת לגדול מהחבילה (בגיל ${Math.floor(currentChildAge)})`,
    }
  }

  return {
    status: 'active',
    message: `מושלם עבור ${child.name} (בגיל ${Math.floor(currentChildAge)})`,
  }
}

export function getYearsSincePurchase(purchaseDate: string): number {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  return (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365)
}
