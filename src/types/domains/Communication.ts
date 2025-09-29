export type CommunicationType = 'email' | 'sms' | 'push';
export type CommunicationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type TemplateType = 'job_confirmation' | 'job_reminder' | 'invoice' | 'payment_receipt' | 'estimate' | 'custom';

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject?: string; // For email templates
  content: string;
  variables: string[]; // Available template variables like {{customerName}}, {{jobDate}}
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationReceipt {
  id: string;
  messageId: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  errorMessage?: string;
}

export interface Communication {
  id: string;
  type: CommunicationType;
  templateId?: string;
  recipientId: string; // Client or User ID
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  content: string;
  status: CommunicationStatus;
  // Provider message identifier to reconcile webhook receipts
  messageId?: string;
  scheduledFor?: string;
  sentAt?: string;
  receipt?: CommunicationReceipt;
  relatedEntityType?: 'job' | 'invoice' | 'estimate' | 'visit';
  relatedEntityId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}