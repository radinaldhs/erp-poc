import type { AttendanceRecord, Department, Employee, LeaveRequest, PayrollRun } from '@/types'
import { nextInt, pad, pastDateISO, pick, uid } from './prng'

const DEPT_NAMES = ['Sales', 'Engineering', 'Finance', 'Operations', 'HR']
const FIRST = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Quinn', 'Avery', 'Parker', 'Hunter']
const LAST = ['Carter', 'Reed', 'Brooks', 'Hayes', 'Gray', 'Owens', 'Rivers', 'Holt', 'Lane', 'Ford']

export function buildDepartments(): Department[] {
  const createdAt = pastDateISO(540)
  return DEPT_NAMES.map((name, i) => ({
    id: uid('dp_'),
    code: `DEP-${pad(i + 1, 2)}`,
    name,
    head: `${pick(FIRST)} ${pick(LAST)}`,
    headCount: nextInt(5, 20),
    createdAt,
    updatedAt: createdAt
  }))
}

export function buildEmployees(count: number, departments: Department[]): Employee[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(720)
    return {
      id: uid('em_'),
      code: `EMP-${pad(i + 1, 4)}`,
      firstName: pick(FIRST),
      lastName: pick(LAST),
      contact: {
        email: `emp${i + 1}@democompany.example.com`,
        phone: `+1-555-${pad(nextInt(1000, 9999), 4)}`
      },
      departmentId: pick(departments).id,
      position: pick(['Associate', 'Senior Associate', 'Manager', 'Director', 'Specialist']),
      hireDate: pastDateISO(1800),
      salary: nextInt(40, 180) * 1000,
      status: 'active',
      manager: `${pick(FIRST)} ${pick(LAST)}`,
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildAttendance(employees: Employee[], count = 120): AttendanceRecord[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(30)
    return {
      id: uid('at_'),
      employeeId: pick(employees).id,
      date: createdAt,
      checkIn: `${pad(nextInt(7, 10), 2)}:${pad(nextInt(0, 59), 2)}`,
      checkOut: `${pad(nextInt(16, 19), 2)}:${pad(nextInt(0, 59), 2)}`,
      status: pick(['present', 'present', 'present', 'late', 'leave', 'absent'] as const),
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildPayroll(employees: Employee[]): PayrollRun[] {
  return employees.slice(0, Math.min(30, employees.length)).map((emp) => {
    const createdAt = pastDateISO(30)
    const base = emp.salary / 12
    const allowances = nextInt(200, 1500)
    const deductions = nextInt(100, 800)
    return {
      id: uid('py_'),
      period: `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1, 2)}`,
      employeeId: emp.id,
      baseSalary: base,
      allowances,
      deductions,
      net: base + allowances - deductions,
      status: pick(['draft', 'finalized', 'paid'] as const),
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildLeaveRequests(employees: Employee[], count = 30): LeaveRequest[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(60)
    const start = pastDateISO(40)
    const end = new Date(start)
    const days = nextInt(1, 10)
    end.setDate(end.getDate() + days)
    return {
      id: uid('lv_'),
      employeeId: pick(employees).id,
      type: pick(['annual', 'sick', 'unpaid', 'maternity'] as const),
      startDate: start,
      endDate: end.toISOString(),
      days,
      reason: pick(['Family time', 'Medical', 'Personal matters', 'Rest']),
      status: pick(['pending', 'approved', 'rejected'] as const),
      createdAt,
      updatedAt: createdAt
    }
  })
}
