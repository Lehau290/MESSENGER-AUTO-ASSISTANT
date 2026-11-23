import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getActivityLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { actionType, status, limit = 50, page = 1 } = req.query;

    const where: any = { userId };
    if (actionType && actionType !== 'ALL') {
      where.actionType = String(actionType);
    }
    if (status && status !== 'ALL') {
      where.status = String(status);
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          contact: {
            select: {
              name: true,
              fbUsername: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        page: Number(page),
        limit: take,
        logs,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { actionType, content, recipientName, contactId, processingMethod, status, metadata } = req.body;

    const log = await prisma.activityLog.create({
      data: {
        userId,
        actionType,
        content,
        recipientName: recipientName || 'Người nhận',
        contactId: contactId || null,
        processingMethod: processingMethod || 'MANUAL_CONFIRMED',
        status: status || 'DRAFT',
        metadata: metadata ? (typeof metadata === 'object' ? JSON.stringify(metadata) : metadata) : null,
      },
    });

    res.status(201).json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    await prisma.activityLog.deleteMany({ where: { userId } });
    res.json({ success: true, message: 'Đã xóa toàn bộ lịch sử hoạt động' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
