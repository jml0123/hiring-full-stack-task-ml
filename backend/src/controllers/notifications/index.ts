import { Request, Response, NextFunction } from 'express';
import { prisma } from '$prisma/client';
import { NotificationQueries } from '$queries/notification.queries';
import { NotificationService } from '$services/notification.service';

// NOTIFICATIONS_REVIEW -- MEDIUM PRIORITY -- Define the expected request/response shapes for this controller in dtos.
// DEPRECATED - use services in controllers instead of
// direct/inline code executions of e.g. prisma calls
export class NotificationsController {
  private notificationQueries: NotificationQueries;
  private notificationService: NotificationService;

  constructor() {
    this.notificationQueries = new NotificationQueries();
    this.notificationService = new NotificationService();
  }

  /**
   * POST /api/notifications
   */
  // NOTIFICATIONS_REVIEW -- URGENT PRIORITY -- Since this is a controller, we should not call prisma directly here. Use service layer instead. Controller should be concerned with request/response shape.
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: req.user!.id,
          message: req.body.message,
          type: req.body.type,
        },
      });

      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications
   * Get all notifications for authenticated user
   */
    // NOTIFICATIONS_REVIEW -- URGENT PRIORITY -- Same as above, use service layer.
  async getForUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await this.notificationQueries.getNotificationsForUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count for authenticated user
   */
  // NOTIFICATIONS_REVIEW -- URGENT PRIORITY -- Use service layer. You can reuse logic here and put it inside service.
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: req.user!.id,
          readAt: null,
        },
      });
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  // Mark as read/unread. Optional query: ?read=false to mark as unread (default: mark as read)
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const read = req.query.read !== 'false'; // query param is string; ?read=false → unread
      const notification = await this.notificationService.markAsRead(
        req.params.notificationId,
        req.user!.id,
        read,
      );
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  // Mark multiple or all as read/unread. Body: { notificationIds?: string[] }. Omit or [] = all. Optional ?read=false for unread.
  async markAsReadMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const read = req.query.read !== 'false';
      const notificationIds = req.body?.notificationIds as string[] | undefined;
      const notifications = await this.notificationService.markAsReadMany(
        notificationIds,
        req.user!.id,
        read,
      );
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }
}
