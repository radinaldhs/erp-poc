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

  const addEmployee = (x: Employee): void => { employees.value = [x, ...employees.value] }
  const updateEmployee = (x: Employee): void => { employees.value = employees.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteEmployee = (id: string): void => { employees.value = employees.value.filter((i) => i.id !== id) }

  const addDepartment = (x: Department): void => { departments.value = [x, ...departments.value] }
  const updateDepartment = (x: Department): void => { departments.value = departments.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteDepartment = (id: string): void => { departments.value = departments.value.filter((i) => i.id !== id) }

  const addAttendance = (x: AttendanceRecord): void => { attendance.value = [x, ...attendance.value] }
  const updateAttendance = (x: AttendanceRecord): void => { attendance.value = attendance.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteAttendance = (id: string): void => { attendance.value = attendance.value.filter((i) => i.id !== id) }

  const addPayroll = (x: PayrollRun): void => { payroll.value = [x, ...payroll.value] }
  const updatePayroll = (x: PayrollRun): void => { payroll.value = payroll.value.map((i) => (i.id === x.id ? x : i)) }
  const deletePayroll = (id: string): void => { payroll.value = payroll.value.filter((i) => i.id !== id) }

  const addLeave = (x: LeaveRequest): void => { leaveRequests.value = [x, ...leaveRequests.value] }
  const updateLeave = (x: LeaveRequest): void => { leaveRequests.value = leaveRequests.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteLeave = (id: string): void => { leaveRequests.value = leaveRequests.value.filter((i) => i.id !== id) }

  return {
    employees,
    departments,
    attendance,
    payroll,
    leaveRequests,
    employeeById,
    departmentById,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    addPayroll,
    updatePayroll,
    deletePayroll,
    addLeave,
    updateLeave,
    deleteLeave
  }
})
