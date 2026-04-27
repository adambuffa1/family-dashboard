export interface User {
  id: number
  username: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface Expense {
  id: number
  userId: number
  amount: number
  category: string
  description?: string
  date: string
  receiptImage?: string
  items?: string
  createdAt: string
  user?: { username: string }
}

export interface Budget {
  id: number
  category: string
  amount: number
  month: number
  year: number
}

export interface Recipe {
  id: number
  name: string
  category: string
  ingredients: string
  steps: string[]
  image?: string
  createdAt: string
  userId: number
  user?: { username: string }
}

export interface EnergyReading {
  id: number
  type: string
  value: number
  date: string
  image?: string
  userId: number
  user?: { username: string }
}

export const KATEGORIE_VYDAVKOV = [
  { value: 'jedlo', label: 'Jedlo', color: '#FF6384' },
  { value: 'zabava', label: 'Zábava', color: '#36A2EB' },
  { value: 'domacnost', label: 'Domácnosť', color: '#FFCE56' },
  { value: 'pes', label: 'Pes', color: '#4BC0C0' },
  { value: 'ostatne', label: 'Ostatné', color: '#9966FF' },
] as const

export const KATEGORIE_RECEPTOV = [
  { value: 'polievky', label: 'Polievky' },
  { value: 'hlavne', label: 'Hlavné jedlá' },
  { value: 'rychle', label: 'Rýchle večere' },
] as const

export const TYPY_ENERGIE = [
  { value: 'elektrina', label: 'Elektrina', color: '#FFCE56', unit: 'kWh' },
  { value: 'plyn', label: 'Plyn', color: '#FF6384', unit: 'm³' },
  { value: 'voda', label: 'Voda', color: '#36A2EB', unit: 'm³' },
] as const
