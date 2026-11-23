import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const [
      totalDrafts,
      totalTemplates,
      totalContacts,
      totalRules,
      pendingSchedulesCount,
      confirmedSentCount,
      recentActivities,
      upcomingSchedules,
    ] = await Promise.all([
      prisma.messageDraft.count({ where: { userId } }),
      prisma.messageTemplate.count({ where: { userId } }),
      prisma.contact.count({ where: { userId } }),
      prisma.automationRule.count({ where: { userId } }),
      prisma.scheduledMessage.count({ where: { userId, status: 'PENDING' } }),
      prisma.activityLog.count({
        where: {
          userId,
          status: 'CONFIRMED_MANUAL_SENT',
        },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.scheduledMessage.findMany({
        where: {
          userId,
          status: 'PENDING',
        },
        include: {
          contact: {
            select: {
              name: true,
              fbUsername: true,
              relationshipType: true,
            },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
    ]);

    // Thống kê 7 ngày gần đây
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logsLast7Days = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
        actionType: true,
        status: true,
      },
    });

    const dayMap: Record<string, { date: string; generated: number; sent: number; reminders: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      dayMap[key] = { date: key, generated: 0, sent: 0, reminders: 0 };
    }

    logsLast7Days.forEach((log) => {
      const d = new Date(log.createdAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      if (dayMap[key]) {
        if (log.actionType === 'AI_GENERATE') {
          dayMap[key].generated += 1;
        } else if (log.status === 'CONFIRMED_MANUAL_SENT') {
          dayMap[key].sent += 1;
        } else if (log.actionType === 'SCHEDULE_REMIND') {
          dayMap[key].reminders += 1;
        }
      }
    });

    const chartData = Object.values(dayMap);

    res.json({
      success: true,
      data: {
        overview: {
          totalDrafts,
          totalTemplates,
          totalContacts,
          totalRules,
          pendingSchedulesCount,
          confirmedSentCount,
        },
        recentActivities,
        upcomingSchedules,
        chartData,
        systemStatus: {
          backend: 'ONLINE',
          database: 'CONNECTED',
          scheduler: 'ACTIVE',
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
