export const ACCOUNT_TYPES = {
  cash: "Efectivo",
  bank: "Cuenta bancaria",
  wallet: "Billetera digital",
  other: "Otra",
} as const;

export type AccountType = keyof typeof ACCOUNT_TYPES;