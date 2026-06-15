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
  purchasedPackages: string[]
  children: ChildInfo[]
}

const STORAGE_KEY = 'petite_dreams_user'

export function login(email: string, _password: string): User | null {
  const existingUser = getCurrentUser()
  if (existingUser && existingUser.email === email) {
    return existingUser
  }

  const user: User = {
    id: '1',
    email,
    name: email.split('@')[0],
    purchasedPackages: [],
    children: [],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? (JSON.parse(data) as User) : null
}

export function purchasePackage(
  packageId: string,
  childName?: string,
  childAge?: number,
  gender?: string,
  theme?: string,
  colorPreference?: string,
): void {
  const user = getCurrentUser()
  if (user && !user.purchasedPackages.includes(packageId)) {
    user.purchasedPackages.push(packageId)

    if (childName && childAge) {
      user.children.push({
        name: childName,
        age: childAge,
        packageId,
        purchaseDate: new Date().toISOString(),
        gender,
        theme,
        colorPreference,
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}

export function purchaseAdditionalChild(
  packageId: string,
  childName: string,
  childAge: number,
  gender?: string,
  theme?: string,
  colorPreference?: string,
): void {
  const user = getCurrentUser()
  if (user) {
    user.children.push({
      name: childName,
      age: childAge,
      packageId,
      purchaseDate: new Date().toISOString(),
      gender,
      theme,
      colorPreference,
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}

export function hasPurchased(packageId: string): boolean {
  const user = getCurrentUser()
  return user?.purchasedPackages.includes(packageId) ?? false
}

export function getChildForPackage(packageId: string): ChildInfo | undefined {
  const user = getCurrentUser()
  return user?.children.find((child) => child.packageId === packageId)
}

export function getChildrenForPackage(packageId: string): ChildInfo[] {
  const user = getCurrentUser()
  return user?.children.filter((child) => child.packageId === packageId) || []
}

export function getYearsSincePurchase(purchaseDate: string): number {
  const purchase = new Date(purchaseDate)
  const now = new Date()
  return (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365)
}
