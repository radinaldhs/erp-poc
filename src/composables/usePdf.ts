import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Promo, PromoAuditEntry } from '@/types'
import { formatCurrency, formatDate } from './useFormat'

function drawLetterhead(doc: jsPDF, company: string): void {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(company, 14, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Promo Approval Letter', 14, 25)
  doc.setDrawColor(200)
  doc.line(14, 28, 196, 28)
}

function drawFooter(doc: jsPDF): void {
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFontSize(8)
  doc.setTextColor(120)
  doc.text(
    `Generated on ${new Date().toLocaleString()} — This document is for demonstration purposes.`,
    14,
    pageHeight - 10
  )
  doc.setTextColor(0)
}

function renderPromoDetails(doc: jsPDF, promo: Promo, startY: number): number {
  autoTable(doc, {
    startY,
    head: [['Field', 'Value']],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 82, 190] },
    body: [
      ['Promo Name', promo.promoName],
      ['Promo Type', promo.promoType],
      ['Target Region', promo.targetRegion],
      ['Customer Segment', promo.targetCustomerSegment],
      ['Start Date', formatDate(promo.startDate)],
      ['End Date', formatDate(promo.endDate)],
      ['Discount', `${promo.discountPercent}%`],
      ['Estimated Budget', formatCurrency(promo.estimatedBudget)],
      ['Expected Revenue Uplift', formatCurrency(promo.expectedRevenueUplift)],
      ['Submitted By', promo.submittedBy],
      ['Current Status', promo.status]
    ]
  })
  const result = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
  return result?.finalY ?? startY + 60
}

function renderApprovalChain(doc: jsPDF, log: PromoAuditEntry[], startY: number): number {
  const approvalRows = log
    .filter((entry) => entry.action !== 'comment')
    .map((entry) => [
      entry.role,
      entry.actor,
      entry.action.charAt(0).toUpperCase() + entry.action.slice(1),
      formatDate(entry.timestamp, 'MMM d, yyyy h:mm a'),
      entry.comment ?? '-'
    ])
  autoTable(doc, {
    startY: startY + 8,
    head: [['Role', 'Actor', 'Action', 'Timestamp', 'Comment']],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 82, 190] },
    body: approvalRows
  })
  const result = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
  return result?.finalY ?? startY + 60
}

function renderSignatures(doc: jsPDF, startY: number): void {
  const roles = ['Area Manager', 'Regional Manager', 'Finance Director']
  doc.setFontSize(10)
  roles.forEach((role, index) => {
    const x = 14 + index * 60
    doc.line(x, startY + 25, x + 50, startY + 25)
    doc.text(role, x, startY + 32)
  })
}

export function generateApprovalLetter(promo: Promo, companyName = 'Demo Company'): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  drawLetterhead(doc, companyName)
  doc.setFontSize(11)
  doc.text(
    `This letter confirms the review status for promo "${promo.promoName}".`,
    14,
    38
  )
  const afterDetails = renderPromoDetails(doc, promo, 44)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Approval Chain', 14, afterDetails + 10)
  doc.setFont('helvetica', 'normal')
  const afterChain = renderApprovalChain(doc, promo.auditLog, afterDetails + 10)
  renderSignatures(doc, afterChain + 10)
  drawFooter(doc)
  doc.save(`promo-${promo.id.slice(0, 8)}.pdf`)
}

export function usePdf() {
  return { generateApprovalLetter }
}
