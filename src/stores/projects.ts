import { defineStore } from 'pinia'
import { useStorage } from '@/composables/useStorage'
import { STORAGE_KEYS } from '@/data/keys'
import type { Project, ProjectTask, Timesheet } from '@/types'

export const useProjectStore = defineStore('projects', () => {
  const projects = useStorage<Project[]>(STORAGE_KEYS.projects, [])
  const tasks = useStorage<ProjectTask[]>(STORAGE_KEYS.tasks, [])
  const timesheets = useStorage<Timesheet[]>(STORAGE_KEYS.timesheets, [])

  const projectById = (id: string) => projects.value.find((p) => p.id === id)
  const tasksByProject = (id: string) => tasks.value.filter((t) => t.projectId === id)

  return { projects, tasks, timesheets, projectById, tasksByProject }
})
