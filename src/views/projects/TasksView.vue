<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { v4 as uuid } from 'uuid'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import KanbanBoard from '@/components/shared/KanbanBoard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import EntityFormModal from '@/components/shared/EntityFormModal.vue'
import { Plus, SlidersHorizontal, X } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/composables/useFormat'
import type { ProjectTask } from '@/types'

const projects = useProjectStore()
const toast = useToast()

const STAGES: { key: ProjectTask['status']; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' }
]

const filters = reactive({ projectId: '', assignee: '', priority: '' })

const filteredTasks = computed(() =>
  projects.tasks.filter((t) => {
    if (filters.projectId && t.projectId !== filters.projectId) return false
    if (filters.assignee && t.assignee !== filters.assignee) return false
    if (filters.priority && t.priority !== filters.priority) return false
    return true
  })
)

const columns = computed(() =>
  STAGES.map((s) => ({
    key: s.key,
    label: s.label,
    items: filteredTasks.value.filter((t) => t.status === s.key)
  }))
)

const assignees = computed(() => Array.from(new Set(projects.tasks.map((t) => t.assignee))).filter(Boolean))

const activeFilterCount = computed(() =>
  (filters.projectId ? 1 : 0) + (filters.assignee ? 1 : 0) + (filters.priority ? 1 : 0)
)
const filterOpen = ref(false)

function resetFilters(): void {
  filters.projectId = ''
  filters.assignee = ''
  filters.priority = ''
}

const priorityTone = (p: ProjectTask['priority']): 'danger' | 'warning' | 'neutral' => {
  if (p === 'high') return 'danger'
  if (p === 'medium') return 'warning'
  return 'neutral'
}

const showCreate = ref(false)
const form = reactive({
  title: '',
  description: '',
  projectId: '',
  assignee: '',
  dueDate: '',
  status: 'todo' as ProjectTask['status'],
  priority: 'medium' as ProjectTask['priority']
})

function openCreate(): void {
  form.title = ''
  form.description = ''
  form.projectId = projects.projects[0]?.id ?? ''
  form.assignee = assignees.value[0] ?? 'Demo User'
  form.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  form.status = 'todo'
  form.priority = 'medium'
  showCreate.value = true
}

function save(): void {
  if (!form.title.trim()) {
    toast.error('Title is required')
    return
  }
  if (!form.projectId) {
    toast.error('Project is required')
    return
  }
  const now = new Date().toISOString()
  projects.addTask({
    id: uuid(),
    projectId: form.projectId,
    title: form.title,
    description: form.description,
    assignee: form.assignee,
    dueDate: form.dueDate,
    status: form.status,
    priority: form.priority,
    createdAt: now,
    updatedAt: now
  })
  toast.success('Task created', form.title)
  showCreate.value = false
}
</script>

<template>
  <BasePageHeader title="Tasks" subtitle="Kanban board of in-flight project work.">
    <template #actions>
      <BaseButton variant="secondary" @click="filterOpen = true">
        <SlidersHorizontal class="h-4 w-4" />
        <span>Filters</span>
        <span
          v-if="activeFilterCount > 0"
          class="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold"
        >{{ activeFilterCount }}</span>
      </BaseButton>
      <BaseButton variant="primary" @click="openCreate">
        <Plus class="h-4 w-4" />
        <span>New Task</span>
      </BaseButton>
    </template>
  </BasePageHeader>
  <KanbanBoard :columns="columns">
    <template #card="{ item }">
      <div>
        <p class="text-sm font-medium truncate">{{ item.title }}</p>
        <p class="text-[11px] text-text-muted truncate">{{ item.assignee }}</p>
        <div class="flex items-center justify-between mt-2">
          <BaseBadge :tone="priorityTone(item.priority)" class="capitalize">{{ item.priority }}</BaseBadge>
          <span class="text-[11px] text-text-muted">{{ formatDate(item.dueDate) }}</span>
        </div>
      </div>
    </template>
  </KanbanBoard>

  <Teleport to="body">
    <div v-if="filterOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="filterOpen = false" />
      <aside class="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-bg border-l border-border shadow-xl flex flex-col">
        <div class="flex items-center justify-between px-4 h-14 border-b border-border">
          <h3 class="text-sm font-semibold">Filters</h3>
          <button class="text-text-muted hover:text-text" @click="filterOpen = false">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <BaseSelect
            v-model="filters.projectId"
            label="Project"
            :options="[
              { value: '', label: 'Any project' },
              ...projects.projects.map((p) => ({ value: p.id, label: p.name }))
            ]"
          />
          <BaseSelect
            v-model="filters.assignee"
            label="Assignee"
            :options="[
              { value: '', label: 'Any assignee' },
              ...assignees.map((a) => ({ value: a, label: a }))
            ]"
          />
          <BaseSelect
            v-model="filters.priority"
            label="Priority"
            :options="[
              { value: '', label: 'Any priority' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }
            ]"
          />
        </div>
        <div class="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
          <BaseButton variant="ghost" @click="resetFilters">Reset</BaseButton>
          <BaseButton variant="primary" @click="filterOpen = false">Apply</BaseButton>
        </div>
      </aside>
    </div>
  </Teleport>

  <EntityFormModal
    :open="showCreate"
    title="New Task"
    save-label="Create Task"
    @close="showCreate = false"
    @submit="save"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BaseInput v-model="form.title" label="Title" required />
      <BaseSelect
        v-model="form.projectId"
        label="Project"
        :options="projects.projects.map((p) => ({ value: p.id, label: p.name }))"
        required
      />
      <BaseInput v-model="form.assignee" label="Assignee" />
      <BaseInput v-model="form.dueDate" type="date" label="Due Date" />
      <BaseSelect
        v-model="form.status"
        label="Status"
        :options="STAGES.map((s) => ({ value: s.key, label: s.label }))"
      />
      <BaseSelect
        v-model="form.priority"
        label="Priority"
        :options="[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ]"
      />
    </div>
    <BaseTextarea v-model="form.description" label="Description" :rows="3" />
  </EntityFormModal>
</template>
