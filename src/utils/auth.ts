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
