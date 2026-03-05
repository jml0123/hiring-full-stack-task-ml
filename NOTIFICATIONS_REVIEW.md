# Notifications feature – review comments

All `NOTIFICATIONS_REVIEW` comments from the codebase, grouped by priority.

---

## URGENT

| Header | Location | Comment |
|--------|----------|--------|
| **Use service in controller** | `controllers/notifications/index.ts` → `create` | Since this is a controller, we should not call prisma directly here. Use service layer instead. Controller should be concerned with request/response shape. |
| **Fix N+1 query** | `queries/notification.queries.ts` → `getNotificationsWithDetailsForUser` | When moved to the service or repo layer, optimize this db query so that users are not queried for each notification (performance optimization). I understand we're not using this right now, but we should address this quickly because this will eat up our database connections
| **Bind controller methods in route** | There is a bug right now with getUnreadCount route, as the controller is not binded. This will result in a 500 error. See users.router.ts as a reference.
---

## HIGH

| Header | Location | Comment |
|--------|----------|--------|
| **Use service for list** | `controllers/notifications/index.ts` → `getForUser` | Same as above, use service layer. |
| **Use service for count** | `controllers/notifications/index.ts` → `getUnreadCount` | Use service layer. You can reuse logic here and put it inside service. |
| **Order by recency** | `queries/notification.queries.ts` → `getNotificationsForUser` | When we're moving this to the service / repo layer, organize notifications based on recency. |
| **Merge model into service** | `models/notification.model.ts` | Let's move this to the service layer (merge these methods into notifications.service.ts). |
| **Use more descriptive errors** | `services/notification.service.ts` → `send` (catch) | Have more specific error handling here. Refer to utils/errors.ts and user.service.ts as a pattern. |

---

## MEDIUM

| Header | Location | Comment |
|--------|----------|--------|
| **Deprecate query layer** | `queries/notification.queries.ts` (file) | As we're deprecating this, move this to a service layer if methods don't yet exist there. Once you do, please update comment above to look at service layer. (DON'T DELETE THIS FILE YET) |
| **Notification type enum** | `services/notification.service.ts` (type params) | Create an enum for the type of notification (make it more robust and specific) so we can more easily handle downstream processing. |
| **Add repository layer** | `services/notification.service.ts` (class) | Consider using a repository layer for this service. Use user service as a reference. The repo layer should be used for database interactions and mapping for operations done here. |
| **Add mapper and DTO** | `services/notification.service.ts` (class, cont.) | When refactoring to use a repo, we should have a Notification mapper and DTO as well (Refer to User Repository for best practices). |
| **Remove or implement retry** | `services/notification.service.ts` → `send` | We should delete this as its unused, or finish the retry mechanism. We can use Temporal for this. |
| **Validate type before create** | `services/notification.service.ts` → `send` | Since we're defining type enums, make sure to validate the type here before we create the notification or pass it along to the repo. |
| **Enforce mark-read ownership** | `services/notification.service.ts` → `markAsRead` | Make sure that we are only marking as read if the user owns the notification. This would require us to pass in the userId to the method. |

---

## LOW

| Header | Location | Comment |
|--------|----------|--------|
| **Consider pagination support** | `queries/notification.queries.ts` → `getNotificationsForUser` | Consider pagination if the frontend supports it. If not, we can default to selecting all, but we should update the logic with this in mind (add limit/offset, etc.) even if it uses default values. |
| **Consider DB index columns** | `models/notification.model.ts` | Consider indexing commonly accessed columns (userId, readAt). |


## General comments moving forward:

- We should look to move things to the notifications service layer, and depending on time constraints, flesh out the architecture for this using the user workflows as a pattern for best practices. This will make it easier for us to build on top of :)
