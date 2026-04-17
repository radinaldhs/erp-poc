import type { BaseEntity, ContactInfo, ID, ISODate, Money } from './common'

export interface Employee extends BaseEntity {
  code: string
  firstName: string
  lastName: string
  contact: ContactInfo
  departmentId: ID
  position: string
  hireDate: ISODate
  salary: Money
  status: 'active' | 'inactive'
  manager?: string
}

export interface Department extends BaseEntity {
  code: string
  name: string
  head: string
  headCount: number
}

export interface AttendanceRecord extends BaseEntity {
  employeeId: ID
  date: ISODate
  checkIn: string
  checkOut?: string
  status: 'present' | 'absent' | 'late' | 'leave'
}

export interface PayrollRun extends BaseEntity {
  period: string
  employeeId: ID
  baseSalary: Money
  allowances: Money
  deductions: Money
  net: Money
  status: 'draft' | 'finalized' | 'paid'
}

export interface LeaveRequest extends BaseEntity {
  employeeId: ID
  type: 'annual' | 'sick' | 'unpaid' | 'maternity'
  startDate: ISODate
  endDate: ISODate
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}
