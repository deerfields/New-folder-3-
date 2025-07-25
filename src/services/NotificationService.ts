import { WorkPermit } from "@/models/WorkPermit";

export class NotificationService {
  async sendWorkPermitNotification(workPermit: WorkPermit, event: string) {
    // This is a mock implementation.
    console.log(`Sending notification for work permit ${workPermit.id} for event ${event}`);
  }
}
