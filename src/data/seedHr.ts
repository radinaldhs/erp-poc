import type { AttendanceRecord, Department, Employee, LeaveRequest, PayrollRun } from '@/types'
import { nextFloat, nextInt, pad, pastDateISO, pick, uid } from './prng'

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

const PAYROLL_MONTHS_BACK = 4

/**
 * Trailing 4-month payroll history for a representative subset of employees, so the
 * "payroll cost trend" chart shows an actual trend rather than a single data point.
 * Recent periods stay open (draft/finalized); older periods are settled (paid), the
 * way a real payroll history looks.
 */
export function buildPayroll(employees: Employee[]): PayrollRun[] {
  const subset = employees.slice(0, Math.min(30, employees.length))
  const runs: PayrollRun[] = []
  for (let monthsAgo = PAYROLL_MONTHS_BACK - 1; monthsAgo >= 0; monthsAgo--) {
    const periodDate = new Date()
    periodDate.setMonth(periodDate.getMonth() - monthsAgo)
    const period = `${periodDate.getFullYear()}-${pad(periodDate.getMonth() + 1, 2)}`
    const status = monthsAgo === 0 ? pick(['draft', 'finalized'] as const) : monthsAgo === 1 ? 'finalized' : 'paid'
    subset.forEach((emp) => {
      const createdAt = pastDateISO(30 + monthsAgo * 30)
      const base = emp.salary / 12
      const allowances = nextInt(200, 1500)
      const deductions = nextInt(100, 800)
      runs.push({
        id: uid('py_'),
        period,
        employeeId: emp.id,
        baseSalary: base,
        allowances,
        deductions,
        net: base + allowances - deductions,
        status,
        createdAt,
        updatedAt: createdAt
      })
    })
  }
  return runs
}

const LEAVE_TYPE_CONFIG: Record<LeaveRequest['type'], { minDays: number; maxDays: number; reasons: string[] }> = {
  annual: { minDays: 3, maxDays: 10, reasons: ['Rest', 'Family time', 'Personal matters'] },
  sick: { minDays: 1, maxDays: 3, reasons: ['Medical'] },
  unpaid: { minDays: 1, maxDays: 5, reasons: ['Personal matters'] },
  maternity: { minDays: 60, maxDays: 90, reasons: ['Medical'] }
}

/** Maternity leave is rare in a small workforce; weight the type pick accordingly rather than a uniform draw. */
function pickLeaveType(): LeaveRequest['type'] {
  const r = nextFloat()
  if (r < 0.05) return 'maternity'
  if (r < 0.35) return 'sick'
  if (r < 0.55) return 'unpaid'
  return 'annual'
}

export function buildLeaveRequests(employees: Employee[], count = 30): LeaveRequest[] {
  return Array.from({ length: count }, () => {
    const createdAt = pastDateISO(90)
    const type = pickLeaveType()
    const { minDays, maxDays, reasons } = LEAVE_TYPE_CONFIG[type]
    const days = nextInt(minDays, maxDays)
    const start = pastDateISO(90)
    const end = new Date(start)
    end.setDate(end.getDate() + days)
    return {
      id: uid('lv_'),
      employeeId: pick(employees).id,
      type,
      startDate: start,
      endDate: end.toISOString(),
      days,
      reason: pick(reasons),
      status: pick(['pending', 'approved', 'rejected'] as const),
      createdAt,
      updatedAt: createdAt
    }
  })
}
