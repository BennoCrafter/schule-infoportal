// types.ts

// -------------------------
// Validation & Error Types
// -------------------------
export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail: ValidationError[]
}

// -------------------------
// Last Updated Types
// -------------------------
export interface LastUpdated {
  last_update: string | null // ISO datetime string
  has_date: boolean
}

// -------------------------
// News Types
// -------------------------
export interface NewsMessage {
  message: string
  date: string // YYYY-MM-DD
}

// -------------------------
// Substitution Types
// -------------------------
export interface Substitution {
  class_name: string
  period: string
  absent_teacher: string
  substitution_teacher: string
  room: string
  info: string
  date: string // YYYY-MM-DD
}

// -------------------------
// API Filters (optional)
// -------------------------
export interface SubstitutionFilters {
  class_name?: string
  teacher_name?: string
  info?: string
  date?: string
  start_date?: string
  end_date?: string
}
