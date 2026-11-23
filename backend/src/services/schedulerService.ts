import cron from 'node-cron';
import { prisma } from '../config/db';
import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setSocketInstance = (io: SocketIOServer) => {
  ioInstance = io;
};

export class SchedulerService {
  private static isRunning = false;

  public static init() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[SchedulerService] Khởi động tiến trình lập lịch kiểm tra mỗi 30 giây...');

    // Chạy mỗi 30 giây để kiểm tra chính xác các lịch hẹn
    cron.schedule('*/30 * * * * *', async () => {
      await this.checkDueSchedules();
    });
  }

  public static async checkDueSchedules() {
    const now = new Date();

    try {
      const dueMessages = await prisma.scheduledMessage.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: {
            lte: now,
          },
        },
        include: {
          contact: true,
          user: true,
        },
      });

      if (dueMessages.length === 0) return;

      console.log(`[SchedulerService] Tìm thấy ${dueMessages.length} lịch gửi tin nhắn đến hạn.`);

      for (const item of dueMessages) {
        // Cập nhật trạng thái thông báo
        await prisma.scheduledMessage.update({
          where: { id: item.id },
          data: {
            status: 'NOTIFIED',
            lastTriggeredAt: now,
          },
        });

        // Ghi nhật ký hoạt động
        await prisma.activityLog.create({
          data: {
            userId: item.userId,
            actionType: 'SCHEDULE_REMIND',
            content: item.content,
            recipientName: item.contact?.name || 'Người nhận',
            contactId: item.contactId,
            processingMethod: 'MANUAL_CONFIRMED',
            status: 'PENDING_CONFIRMATION',
            metadata: JSON.stringify({
              scheduledMessageId: item.id,
              recurrence: item.recurrenceType,
            }),
          },
        });

        // Bắn Socket.IO thông báo đến Web Client và Desktop App
        if (ioInstance) {
          const payload = {
            id: item.id,
            content: item.content,
            contactName: item.contact?.name || 'Người nhận',
            contactId: item.contactId,
            fbUsername: item.contact?.fbUsername || null,
            fbId: item.contact?.fbId || null,
            scheduledAt: item.scheduledAt,
            title: `Đến giờ gửi tin nhắn cho ${item.contact?.name || 'người nhận'}!`,
            body: item.content,
            mMeUrl: item.contact?.fbUsername
              ? `https://m.me/${item.contact.fbUsername}`
              : item.contact?.fbId
              ? `https://m.me/${item.contact.fbId}`
              : 'https://www.messenger.com',
          };

          // Gửi tới room của user tương ứng
          ioInstance.to(item.userId).emit('reminder:trigger', payload);
          // Đồng thời emit broadcast thông báo để desktop tray nhận được
          ioInstance.emit('notification:toast', payload);
        }

        // Nếu có lặp lại, tự động tính toán thời điểm kế tiếp
        if (item.recurrenceType !== 'ONCE') {
          await this.scheduleNextRecurrence(item);
        }
      }
    } catch (error) {
      console.error('[SchedulerService] Lỗi khi xử lý lịch gửi:', error);
    }
  }

  /**
   * Tính toán thời gian lặp lại kế tiếp
   */
  private static async scheduleNextRecurrence(item: any) {
    const current = new Date(item.scheduledAt);
    let nextDate = new Date(current);

    if (item.recurrenceType === 'DAILY') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (item.recurrenceType === 'WEEKLY') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (item.recurrenceType === 'CUSTOM' && item.recurrenceCustomDays) {
      // Tìm ngày trong tuần tiếp theo
      nextDate.setDate(nextDate.getDate() + 1);
    }

    // Nếu thời điểm tới vẫn trong quá khứ, đẩy tiếp lên tương lai
    while (nextDate <= new Date()) {
      nextDate.setDate(nextDate.getDate() + (item.recurrenceType === 'WEEKLY' ? 7 : 1));
    }

    await prisma.scheduledMessage.create({
      data: {
        userId: item.userId,
        contactId: item.contactId,
        content: item.content,
        scheduledAt: nextDate,
        recurrenceType: item.recurrenceType,
        recurrenceCustomDays: item.recurrenceCustomDays,
        status: 'PENDING',
      },
    });
  }
}
