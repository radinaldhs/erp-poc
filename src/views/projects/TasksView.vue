<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import KanbanBoard from '@/components/shared/KanbanBoard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useProjectStore } from '@/stores/projects'
import { formatDate } from '@/composables/useFormat'
import type { ProjectTask } from '@/types'

const projects = useProjectStore()

const STAGES: { key: ProjectTask['status']; label: string }[] = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' }
]

const columns = computed(() =>
  STAGES.map((s) => ({
    key: s.key,
    label: s.label,
    items: projects.tasks.filter((t) => t.status === s.key)
  }))
)

const priorityTone = (p: ProjectTask['priority']): 'danger' | 'warning' | 'neutral' => {
  if (p === 'high') return 'danger'
  if (p === 'medium') return 'warning'
  return 'neutral'
}
</script>

<template>
  <BasePageHeader title="Tasks" subtitle="Kanban board of in-flight project work." />
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
</template>
