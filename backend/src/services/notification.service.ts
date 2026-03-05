import { prisma } from '$prisma/client';
import { ForbiddenError, NotFoundError, ValidationError } from '$utils/errors';
import { CUID_REGEX } from '$utils/regex';

 //NOTIFICATIONS_REVIEW -- MID PRIORITY -- Create an enum for the type of notification (make it more robust and specific) so we can more easily handle downstream processing
export type NotificationServiceSendParams = {
  userId: string;
  message: string;
  type: string;
};

// NOTIFICATIONS_REVIEW -- MID PRIORITY -- Consider using a repository layer for this service. Use user service as a reference. The repo layer should be used for database interactions and mapping for operations done here.
// NOTIFICATIONS_REVIEW above cont. -- When refactoring to use a repo, we should have a Notification mapper and DTO as well (Refer to User Repository for best practices).
export class NotificationService {
  async send(data: NotificationServiceSendParams) {
    // NOTIFICATIONS_REVIEW -- MID PRIORITY -- We should delete this as its unused, or finish the retry mechanism. We can use Temporal for this 
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    if (!data.userId || !data.message || !data.type) {
      throw new Error('Missing required fields');
    }

    //NOTIFICATIONS_REVIEW -- MID PRIORITY -- Since we're defining type enums, make sure to validate the type here before we create the notification or pass it along to the repo.
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          message: data.message,
          type: data.type,
        },
      });

      return notification;
    } catch (error) {
      // NOTIFICATIONS_REVIEW -- MID PRIORITY -- Have more specific error handling here. Refer to utils/errors.ts and user.service.ts as a pattern.
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // NOTIFICATIONS_REVIEW -- MID PRIORITY -- Make sure that we are only marking as read if the user owns the notification. This would require us to pass in the userId to the method.
  // Read or or unread?
  async markAsRead(notificationId: string, userId: string, read?: boolean) {
    if (!CUID_REGEX.test(notificationId)) {
      throw new ValidationError('Invalid notification ID');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError('You are not authorized to mark this notification as read');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: read === false ?  null : new Date() },

    });
  }

  /**
   * Mark multiple or all notifications as read/unread for a user.
   * @param notificationIds - Optional. If undefined or empty, updates all notifications for the user. Otherwise only the given ids that belong to the user.
   * @param userId - Owner; only their notifications are updated.
   * @param read - true = mark read (default), false = mark unread.
   */
  async markAsReadMany(
    notificationIds: string[] | undefined,
    userId: string,
    read?: boolean,
  ) {
    const readAt = read === false ? null : new Date();

    if (notificationIds != null && notificationIds.length > 0) {
      for (const id of notificationIds) {
        if (!CUID_REGEX.test(id)) {
          throw new ValidationError(`Invalid notification ID: ${id}`);
        }
      }
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: { readAt },
      });
      const list = await prisma.notification.findMany({
        where: { id: { in: notificationIds }, userId },
        orderBy: { createdAt: 'desc' },
      });
      return list;
    }

    await prisma.notification.updateMany({
      where: { userId },
      data: { readAt },
    });
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
