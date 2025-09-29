import { Communication } from '../types/domains/Communication';
import { communicationStorage } from '../utils/communicationStorage';

export type SendParams = {
  type: 'email' | 'sms';
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  content: string;
  templateId?: string;
  relatedEntityType?: 'job' | 'invoice' | 'estimate' | 'visit';
  relatedEntityId?: string;
  createdBy?: string;
};

export class CommunicationService {
  // Simple placeholder renderer: replaces {{var}} with provided map values
  static renderTemplate(content: string, variables: Record<string, string> = {}): string {
    return content.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const k = String(key).trim();
      return Object.prototype.hasOwnProperty.call(variables, k) ? String(variables[k]) : `{{${k}}}`;
    });
  }

  // Simulated provider call that returns a provider messageId
  private static async providerSend(params: SendParams): Promise<{ messageId: string }> {
    // Here we would call SendGrid/Mailgun/Twilio. For MVP, simulate.
    const messageId = `${params.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Simulate small delay
    await new Promise((r) => setTimeout(r, 150));
    return { messageId };
  }

  static async send(params: SendParams): Promise<Communication> {
    const now = new Date().toISOString();
    const id = `c-${Date.now()}`;
    const { messageId } = await CommunicationService.providerSend(params);

    const comm: Communication = {
      id,
      type: params.type,
      templateId: params.templateId,
      recipientId: 'unknown', // can be set by caller later if needed
      recipientEmail: params.type === 'email' ? params.recipientEmail : undefined,
      recipientPhone: params.type === 'sms' ? params.recipientPhone : undefined,
      subject: params.type === 'email' ? params.subject : undefined,
      content: params.content,
      status: 'sent',
      messageId,
      sentAt: now,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
      createdBy: params.createdBy || 'me',
      createdAt: now,
      updatedAt: now,
    };

    communicationStorage.add(comm);
    return comm;
  }

  // Simulate webhook-driven updates
  static simulateDeliveryUpdate(id: string, onUpdate?: (updated: Communication) => void) {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success
      const updated = communicationStorage.update(
        id,
        success
          ? { status: 'delivered', receipt: { deliveredAt: new Date().toISOString() } as any }
          : { status: 'failed', receipt: { errorMessage: 'Delivery failed (simulated)' } as any }
      ) as Communication | null;
      if (updated && onUpdate) onUpdate(updated);
    }, 2000);
  }
}
