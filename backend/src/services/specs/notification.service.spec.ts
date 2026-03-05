import { ForbiddenError, NotFoundError, ValidationError } from '$utils/errors';
import { NotificationService } from '$services/notification.service';

const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateMany = jest.fn();
const mockFindMany = jest.fn();

jest.mock('$prisma/client', () => ({
  prisma: {
    notification: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

describe('NotificationService', () => {
  let service: NotificationService;

  const validCuid = 'cl9ebqkxk0000mc04r8fzagsy';
  const ownerId = 'user-owner-123';
  const otherUserId = 'user-other-456';

  const ownedNotification = {
    id: validCuid,
    userId: ownerId,
    message: 'Test',
    type: 'test',
    readAt: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
  });

  describe('markAsRead', () => {
    it('marks as read with valid id and owned notification', async () => {
      mockFindUnique.mockResolvedValue(ownedNotification);
      const updated = { ...ownedNotification, readAt: new Date() };
      mockUpdate.mockResolvedValue(updated);

      const result = await service.markAsRead(validCuid, ownerId);

      expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: validCuid } });
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: validCuid },
        data: { readAt: expect.any(Date) },
      });
      expect(result).toEqual(updated);
      expect(result.readAt).toBeDefined();
    });

    it('marks as unread when read is false', async () => {
      mockFindUnique.mockResolvedValue(ownedNotification);
      const updated = { ...ownedNotification, readAt: null };
      mockUpdate.mockResolvedValue(updated);

      const result = await service.markAsRead(validCuid, ownerId, false);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: validCuid },
        data: { readAt: null },
      });
      expect(result.readAt).toBeNull();
    });

    it('throws ForbiddenError when notification belongs to another user', async () => {
      mockFindUnique.mockResolvedValue(ownedNotification);

      await expect(service.markAsRead(validCuid, otherUserId)).rejects.toThrow(ForbiddenError);
      await expect(service.markAsRead(validCuid, otherUserId)).rejects.toThrow(
        /not authorized to mark this notification as read/,
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('throws ValidationError when notification id is not a valid CUID', async () => {
      await expect(service.markAsRead('invalid-id', ownerId)).rejects.toThrow(ValidationError);
      await expect(service.markAsRead('invalid-id', ownerId)).rejects.toThrow('Invalid notification ID');
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it('throws NotFoundError when notification id is valid but not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(service.markAsRead(validCuid, ownerId)).rejects.toThrow(NotFoundError);
      await expect(service.markAsRead(validCuid, ownerId)).rejects.toThrow('Notification not found');
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('markAsReadMany', () => {
    const validCuid2 = 'cl9ebqkxk0000mc04r8fzagsz';
    const notificationList = [
      { ...ownedNotification, id: validCuid },
      { ...ownedNotification, id: validCuid2, userId: ownerId },
    ];

    it('marks multiple notifications as read when notificationIds provided', async () => {
      mockUpdateMany.mockResolvedValue({ count: 2 });
      mockFindMany.mockResolvedValue(notificationList);

      const result = await service.markAsReadMany([validCuid, validCuid2], ownerId);

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { id: { in: [validCuid, validCuid2] }, userId: ownerId },
        data: { readAt: expect.any(Date) },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { id: { in: [validCuid, validCuid2] }, userId: ownerId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(notificationList);
    });

    it('marks multiple notifications as unread when read is false', async () => {
      mockUpdateMany.mockResolvedValue({ count: 2 });
      mockFindMany.mockResolvedValue(notificationList.map((n) => ({ ...n, readAt: null })));

      await service.markAsReadMany([validCuid, validCuid2], ownerId, false);

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { id: { in: [validCuid, validCuid2] }, userId: ownerId },
        data: { readAt: null },
      });
    });

    it('marks all notifications for user when notificationIds is undefined', async () => {
      mockUpdateMany.mockResolvedValue({ count: 5 });
      mockFindMany.mockResolvedValue(notificationList);

      const result = await service.markAsReadMany(undefined, ownerId);

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { userId: ownerId },
        data: { readAt: expect.any(Date) },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: ownerId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(notificationList);
    });

    it('marks all notifications for user when notificationIds is empty array', async () => {
      mockUpdateMany.mockResolvedValue({ count: 3 });
      mockFindMany.mockResolvedValue(notificationList);

      await service.markAsReadMany([], ownerId);

      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: { userId: ownerId },
        data: { readAt: expect.any(Date) },
      });
      expect(mockFindMany).toHaveBeenCalledWith({
        where: { userId: ownerId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('throws ValidationError when any notification id is invalid', async () => {
      await expect(
        service.markAsReadMany([validCuid, 'bad-id', validCuid2], ownerId),
      ).rejects.toThrow(ValidationError);
      await expect(
        service.markAsReadMany([validCuid, 'bad-id', validCuid2], ownerId),
      ).rejects.toThrow(/Invalid notification ID: bad-id/);
      expect(mockUpdateMany).not.toHaveBeenCalled();
    });
  });
});
