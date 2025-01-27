export type Period = "weekly" | "fortnightly" | "monthly"

export interface Budget {
  id: string
  category: string
  amount: number
  spent: number
  startDate: string
  endDate: string
  userId: string
  period: Period
  isShared: boolean
  sharedWith?: string[]
  ownerName?: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  budgetId: string
  userId: string
  userName: string
  user?: {
    customDisplayName?: string
  }
  category: string
  type: "expense" | "income"
  icon?: string
}

export interface CreditCard {
  id: string
  name: string
  creditLimit: number
  currentBalance: number
  billDate?: string
  userId: string
}

export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  isFixed: boolean
  notes?: string
  paymentMethod: string
  userId: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  userId: string
}

export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  userId: string
}

export type PaymentMethod = "cash" | "credit" | "debit"
