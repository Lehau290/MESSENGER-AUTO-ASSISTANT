import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { status } = req.query;

    const where: any = { userId };
    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const schedules = await prisma.scheduledMessage.findMany({
      where,
      include: {
        contact: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    res.json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { contactId, content, scheduledAt, recurrenceType, recurrenceCustomDays, reminderMinutesBefore } = req.body;

    if (!contactId || !content || !scheduledAt) {
      res.status(400).json({ success: false, message: 'Vui lòng chọn người nhận, nội dung và thời gian gửi' });
      return;
    }

    const schedule = await prisma.scheduledMessage.create({
      data: {
        userId,
        contactId,
        content,
        scheduledAt: new Date(scheduledAt),
        recurrenceType: recurrenceType || 'ONCE',
        recurrenceCustomDays: recurrenceCustomDays || null,
        reminderMinutesBefore: Number(reminderMinutesBefore || 0),
        status: 'PENDING',
      },
      include: {
        contact: true,
      },
    });

    // Ghi log tạo lịch
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'SCHEDULE_CREATE',
        content,
        recipientName: schedule.contact?.name || 'Người nhận',
        contactId,
        processingMethod: 'MANUAL_CONFIRMED',
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, message: 'Đã lên lịch nhắc gửi tin nhắn', data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const { content, scheduledAt, recurrenceType, recurrenceCustomDays, status } = req.body;

    await prisma.scheduledMessage.updateMany({
      where: { id, userId },
      data: {
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        recurrenceType,
        recurrenceCustomDays,
        status,
      },
    });

    const updated = await prisma.scheduledMessage.findUnique({
      where: { id },
      include: { contact: true },
    });

    res.json({ success: true, message: 'Cập nhật lịch thành công', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    await prisma.scheduledMessage.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Đã xóa lịch gửi' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postponeSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const { minutes = 15 } = req.body;

    const schedule = await prisma.scheduledMessage.findFirst({ where: { id, userId } });
    if (!schedule) {
      res.status(404).json({ success: false, message: 'Không tìm thấy lịch' });
      return;
    }

    const newTime = new Date(Date.now() + minutes * 60 * 1000);

    const updated = await prisma.scheduledMessage.update({
      where: { id },
      data: {
        scheduledAt: newTime,
        status: 'PENDING',
      },
      include: { contact: true },
    });

    res.json({
      success: true,
      message: `Đã hoãn lịch nhắc gửi thêm ${minutes} phút`,
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmManualSent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    const schedule = await prisma.scheduledMessage.findFirst({
      where: { id, userId },
      include: { contact: true },
    });

    if (!schedule) {
      res.status(404).json({ success: false, message: 'Không tìm thấy lịch' });
      return;
    }

    // Cập nhật trạng thái lịch sang CONFIRMED_MANUAL_SENT
    await prisma.scheduledMessage.update({
      where: { id },
      data: {
        status: 'CONFIRMED_MANUAL_SENT',
        lastTriggeredAt: new Date(),
      },
    });

    // Cập nhật thời điểm liên hệ gần nhất của Contact
    if (schedule.contactId) {
      await prisma.contact.update({
        where: { id: schedule.contactId },
        data: { lastContactedAt: new Date() },
      });
    }

    // Ghi ActivityLog xác nhận rõ ràng
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'MANUAL_SENT_CONFIRMED',
        content: schedule.content,
        recipientName: schedule.contact?.name || 'Người nhận',
        contactId: schedule.contactId,
        processingMethod: 'MANUAL_CONFIRMED',
        status: 'CONFIRMED_MANUAL_SENT',
        metadata: JSON.stringify({
          scheduledId: schedule.id,
          confirmedAt: new Date().toISOString(),
        }),
      },
    });

    res.json({
      success: true,
      message: 'Đã xác nhận đã gửi tin nhắn thành công qua Messenger!',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
