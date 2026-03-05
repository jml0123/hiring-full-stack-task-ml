import { Notification, prisma } from '$prisma/client';

// Added during seed funding round when we were moving fast
// TODO: Refactor to service pattern
// NOTIFICATIONS_REVIEW -- HIGH PRIORITY -- Let's move this to the service layer (merge these methods into notifications.service.ts).
// NOTIFICATIONS_REVIEW -- LOW PRIORITY -- Consider indexing commonly accessed columns (userId, readAt)

export class NotificationModel {
  static async markAsRead(notification: Notification) {
    return prisma.notification.update({
      where: { id: notification.id },
      data: { readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        readAt: null
      },
      data: { readAt: new Date() },
    });
  }
}
