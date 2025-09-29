import { Job } from '../components/dashboard/job/types';
import { Invoice } from './invoiceStorage';

export function createInvoiceFromJob(job: Job): Invoice {
  const now = new Date();
  const issueDate = now.toISOString().slice(0, 10);
  const due = new Date(now);
  due.setDate(due.getDate() + 30);
  const dueDate = due.toISOString().slice(0, 10);

  const items = [] as Invoice['items'];

  // Primary service line
  const baseAmount = job.actualCost && job.actualCost > 0 ? job.actualCost : job.estimatedCost;
  items.push({
    description: `Service - ${job.title}`,
    quantity: 1,
    unitPrice: baseAmount,
    total: baseAmount,
  });

  // Optional breakdowns if present (these are additive informational lines; adjust as needed)
  if ((job.laborCost || 0) > 0) {
    items.push({
      description: 'Labor',
      quantity: 1,
      unitPrice: job.laborCost!,
      total: job.laborCost!,
    });
  }
  if ((job.materialCost || 0) > 0) {
    items.push({
      description: 'Materials',
      quantity: 1,
      unitPrice: job.materialCost!,
      total: job.materialCost!,
    });
  }

  const totalAmount = items.reduce((sum, i) => sum + i.total, 0);

  const invoice: Invoice = {
    id: `inv_${Date.now()}`,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Date.now()}`,
    clientName: job.clientName,
    propertyAddress: job.propertyAddress,
    issueDate,
    dueDate,
    status: 'draft',
    totalAmount,
    paidAmount: 0,
    balance: totalAmount,
    description: job.description || job.scope?.description || job.title,
    items,
    jobId: job.id,
    jobNumber: job.jobNumber,
    estimateId: job.estimateId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return invoice;
}
