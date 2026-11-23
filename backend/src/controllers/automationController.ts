import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AutomationService } from '../services/automationService';

export const getRules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const rules = await prisma.automationRule.findMany({
      where: { userId },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { name, keywords, replyContent, triggerCondition, activeHoursStart, activeHoursEnd, isEnabled, matchType, priority } = req.body;

    if (!name || !keywords || !replyContent) {
      res.status(400).json({ success: false, message: 'Vui lòng điền tên kịch bản, từ khóa và nội dung phản hồi' });
      return;
    }

    const rule = await prisma.automationRule.create({
      data: {
        userId,
        name,
        keywords,
        replyContent,
        triggerCondition: triggerCondition || 'CONTAINS',
        activeHoursStart: activeHoursStart || null,
        activeHoursEnd: activeHoursEnd || null,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        matchType: matchType || 'SUGGEST',
        priority: Number(priority || 0),
      },
    });

    res.status(201).json({ success: true, message: 'Tạo kịch bản thành công', data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const { name, keywords, replyContent, triggerCondition, activeHoursStart, activeHoursEnd, isEnabled, matchType, priority } = req.body;

    await prisma.automationRule.updateMany({
      where: { id, userId },
      data: {
        name,
        keywords,
        replyContent,
        triggerCondition,
        activeHoursStart,
        activeHoursEnd,
        isEnabled,
        matchType,
        priority: priority !== undefined ? Number(priority) : undefined,
      },
    });

    const updated = await prisma.automationRule.findUnique({ where: { id } });
    res.json({ success: true, message: 'Cập nhật kịch bản thành công', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    await prisma.automationRule.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Đã xóa kịch bản' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const testRule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { sampleText } = req.body;

    if (!sampleText) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập tin nhắn mẫu để thử nghiệm' });
      return;
    }

    const result = await AutomationService.evaluateRules(userId, sampleText);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
