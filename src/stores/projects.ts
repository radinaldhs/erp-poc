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

  const addProject = (x: Project): void => { projects.value = [x, ...projects.value] }
  const updateProject = (x: Project): void => { projects.value = projects.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteProject = (id: string): void => { projects.value = projects.value.filter((i) => i.id !== id) }

  const addTask = (x: ProjectTask): void => { tasks.value = [x, ...tasks.value] }
  const updateTask = (x: ProjectTask): void => { tasks.value = tasks.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteTask = (id: string): void => { tasks.value = tasks.value.filter((i) => i.id !== id) }

  const addTimesheet = (x: Timesheet): void => { timesheets.value = [x, ...timesheets.value] }
  const updateTimesheet = (x: Timesheet): void => { timesheets.value = timesheets.value.map((i) => (i.id === x.id ? x : i)) }
  const deleteTimesheet = (id: string): void => { timesheets.value = timesheets.value.filter((i) => i.id !== id) }

  return {
    projects,
    tasks,
    timesheets,
    projectById,
    tasksByProject,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addTimesheet,
    updateTimesheet,
    deleteTimesheet
  }
})
