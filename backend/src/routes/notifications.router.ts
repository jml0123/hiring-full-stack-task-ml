import { Router } from 'express';
import { NotificationsController } from '$controllers/notifications';

const router: Router = Router();
const controller = new NotificationsController();

router.get('/', controller.getForUser);
// NOTIFICATIONS_REVIEW -- HIGH PRIORITY -- Need to bind the controller here.
router.get('/unread-count', controller.getUnreadCount);
router.post('/', controller.create);
// PUT /read-many — body: { notificationIds?: string[] } (omit or [] = all). Optional ?read=false to mark as unread (register before :notificationId)
router.put('/read-many', controller.markAsReadMany.bind(controller));
// PUT /:notificationId/read — mark as read. Optional ?read=false to mark as unread
router.put('/:notificationId/read', controller.markAsRead.bind(controller));

export default router;
