import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { AttendanceRecord, Department, Employee, LeaveRequest, PayrollRun } from '@/types'

export const useHrStore = defineStore('hr', () => {
  const employees = useStorage<Employee[]>(STORAGE_KEYS.employees, [])
  const departments = useStorage<Department[]>(STORAGE_KEYS.departments, [])
  const attendance = useStorage<AttendanceRecord[]>(STORAGE_KEYS.attendance, [])
  const payroll = useStorage<PayrollRun[]>(STORAGE_KEYS.payroll, [])
  const leaveRequests = useStorage<LeaveRequest[]>(STORAGE_KEYS.leaveRequests, [])

  const employeeById = (id: string) => employees.value.find((e) => e.id === id)
  const departmentById = (id: string) => departments.value.find((d) => d.id === id)

  return { employees, departments, attendance, payroll, leaveRequests, employeeById, departmentById }
})
