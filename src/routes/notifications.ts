import { Router, Request, Response } from 'express';
import { database } from '../config/database';
import { Notification, NotificationStatus } from '../models/Notification';
import { NotificationRecipient } from '../models/Notification';
import { Tenant } from '../models/Tenant';
import { UserRole } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import { createNotificationRecipients } from '../models/Notification';

const router = Router();

// ایجاد اعلان جدید و ساخت recipients
router.post('/', authenticate, authorize([UserRole.SUPER_ADMIN, UserRole.MALL_ADMIN]), async (req: Request, res: Response) => {
  try {
    const { title, body, type, recipients } = req.body;
    // ایجاد اعلان اصلی
    const notificationRepo = database.getRepository(Notification);
    const notification = notificationRepo.create({
      title,
      message: body,
      type,
      // سایر فیلدهای لازم
      timestamp: new Date(),
      status: NotificationStatus.SENT,
    });
    const saved = await notificationRepo.save(notification);
    // ساخت recipients
    if (Array.isArray(recipients) && recipients.length > 0) {
      await createNotificationRecipients(saved.id, recipients);
    } else {
      // اگر گیرنده خاصی تعیین نشده، به همه مستأجران ارسال شود
      const tenants = await database.getRepository(Tenant).find();
      const allTenantUserIds = tenants.map(t => t.id); // فرض: id همان userId است، در صورت نیاز اصلاح شود
      await createNotificationRecipients(saved.id, allTenantUserIds);
    }
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// وضعیت خواندن اعلان توسط مستأجران (جدید)
router.get('/:id/read-status', authenticate, authorize(['ADMIN', 'MALL_MANAGER']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // دریافت همه رکوردهای recipient برای این اعلان
    const recipients = await database.getRepository(NotificationRecipient).find({ where: { notificationId: id } });
    const tenants = await database.getRepository(Tenant).find();
    const read = recipients.filter(r => r.isRead).map(r => r.userId);
    const allTenantIds = tenants.map(t => t.id);
    const unread = allTenantIds.filter(tid => !read.includes(tid));
    res.json({ read, unread });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get read status' });
  }
});

// ثبت خواندن اعلان توسط کاربر
router.post('/:id/mark-read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const repo = database.getRepository(NotificationRecipient);
    let recipient = await repo.findOne({ where: { notificationId: id, userId } });
    if (!recipient) {
      // اگر رکورد وجود ندارد، ایجاد کن
      recipient = repo.create({ notificationId: id, userId, isRead: true, readAt: new Date() });
    } else {
      recipient.isRead = true;
      recipient.readAt = new Date();
    }
    await repo.save(recipient);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

export default router;
