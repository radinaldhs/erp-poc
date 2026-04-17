import type { Project, ProjectTask, Timesheet } from '@/types'
import { futureDateISO, nextInt, pad, pastDateISO, pick, uid } from './prng'

const PROJECT_NAMES = [
  'CRM Rollout',
  'ERP Migration',
  'Marketplace Integration',
  'Analytics Dashboard',
  'Promo Workflow',
  'Warehouse Automation',
  'Mobile App Phase',
  'Customer Portal',
  'Internal Training',
  'Compliance Review'
]

export function buildProjects(count = 10): Project[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = pastDateISO(300)
    const budget = nextInt(20, 200) * 1000
    return {
      id: uid('pj_'),
      code: `PRJ-${pad(i + 1, 3)}`,
      name: PROJECT_NAMES[i % PROJECT_NAMES.length],
      client: pick(['Customer A1', 'Customer B2', 'Customer C3', 'Internal', 'Customer D1']),
      status: pick(['planned', 'active', 'on_hold', 'completed'] as const),
      startDate: pastDateISO(180),
      endDate: futureDateISO(180),
      budget,
      actualCost: Math.round(budget * (nextInt(10, 90) / 100)),
      progress: nextInt(5, 95),
      manager: pick(['Parker Hayes', 'Morgan Davis', 'Jamie Brooks', 'Taylor Nguyen']),
      createdAt,
      updatedAt: createdAt
    }
  })
}

export function buildTasks(projects: Project[], perProject = 6): ProjectTask[] {
  const out: ProjectTask[] = []
  projects.forEach((p) => {
    for (let i = 0; i < perProject; i++) {
      const createdAt = pastDateISO(90)
      out.push({
        id: uid('tk_'),
        projectId: p.id,
        title: pick(['Kickoff', 'Discovery', 'Design', 'Build', 'QA', 'Deploy', 'Review']) + ' - ' + pad(i + 1, 2),
        assignee: pick(['Parker Hayes', 'Morgan Davis', 'Jamie Brooks', 'Taylor Nguyen', 'Alex Carter']),
        dueDate: futureDateISO(60),
        status: pick(['todo', 'in_progress', 'review', 'done'] as const),
        priority: pick(['low', 'medium', 'high'] as const),
        createdAt,
        updatedAt: createdAt
      })
    }
  })
  return out
}

export function buildTimesheets(tasks: ProjectTask[], count = 80): Timesheet[] {
  return Array.from({ length: count }, () => {
    const task = pick(tasks)
    const createdAt = pastDateISO(30)
    return {
      id: uid('ts_'),
      projectId: task.projectId,
      taskId: task.id,
      employee: pick(['Parker Hayes', 'Morgan Davis', 'Jamie Brooks', 'Taylor Nguyen', 'Alex Carter']),
      date: pastDateISO(14),
      hours: nextInt(1, 8),
      notes: '',
      createdAt,
      updatedAt: createdAt
    }
  })
}
