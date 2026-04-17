<script setup lang="ts">
import { computed } from 'vue'
import BasePageHeader from '@/components/ui/BasePageHeader.vue'
import BaseTable from '@/components/ui/BaseTable.vue'
import { useCrmStore } from '@/stores/crm'
import type { Contact, TableColumn } from '@/types'

const crm = useCrmStore()

const rows = computed(() =>
  crm.contacts.map((c) => ({ ...c, fullName: `${c.firstName} ${c.lastName}` }))
)

const columns: TableColumn<Contact & { fullName: string }>[] = [
  { key: 'fullName', label: 'Name', sortable: true },
  { key: 'title', label: 'Title' },
  { key: 'company', label: 'Company' },
  { key: 'contact.email', label: 'Email' },
  { key: 'contact.phone', label: 'Phone' }
]
</script>

<template>
  <BasePageHeader title="Contacts" subtitle="Key people across partner and customer accounts." />
  <BaseTable :columns="columns" :rows="rows" row-key="id" />
</template>
