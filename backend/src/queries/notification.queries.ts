import { prisma } from '$prisma/client';

// DEPRECATED 
// NOTIFICATIONS_REVIEW -- MID PRIORITY -- As we're deprecating this, move this to a service layer if methods don''t yet exist there. Once you do, please update comment above to look at service layer. (DON'T DELETE THIS FILE YET)

export class NotificationQueries {
  // NOTIFICATIONS_REVIEW -- HIGH PRIORITY -- When we're moving this to the service / repo layer, organize notifications based on recency
  async getNotificationsForUser(userId: string) {
    // OLD PATTERN - No DTO mapping
    //NOTIFICATIONS_REVIEW -- LOW PRIORITY -- Consider pagination if the frontend supports it. If not, we can default to selecting all, but we should update the logic with this in mind (add limit/offset, etc.) even if it uses default values.
    return prisma.notification.findMany({
      where: { userId },
    });
  }

  async getNotificationsWithDetailsForUser(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
    });
    // NOTIFICATIONS_REVIEW -- URGENT -- When moved to the service or repo layer, optimize this db query so that users are not queried for each notification (performance optimization)
    for (const notification of notifications) {
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
      });
      (notification as any).user = user;
    }

    return notifications;
  }

  async getUnreadCountForUsers(userIds: string) {
    // TODO: Return count of unread notifications for the given userIds as a map
  }
}
