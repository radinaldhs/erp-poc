import type { BaseEntity, ID, ISODate, Money } from './common'

export interface Project extends BaseEntity {
  code: string
  name: string
  client: string
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  startDate: ISODate
  endDate: ISODate
  budget: Money
  actualCost: Money
  progress: number
  manager: string
}

export interface ProjectTask extends BaseEntity {
  projectId: ID
  title: string
  description?: string
  assignee: string
  dueDate: ISODate
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
}

export interface Timesheet extends BaseEntity {
  projectId: ID
  taskId: ID
  employee: string
  date: ISODate
  hours: number
  notes?: string
}
