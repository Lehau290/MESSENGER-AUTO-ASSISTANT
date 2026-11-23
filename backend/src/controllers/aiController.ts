import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AIService } from '../services/aiService';

export const generateMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { contactId, recipientName, topic, context, tone = 'FRIENDLY', length = 'MEDIUM', action = 'GENERATE' } = req.body;

    if (!topic) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung hoặc ý tưởng chính bạn muốn nói' });
      return;
    }

    let finalName = recipientName;
    if (contactId && !finalName) {
      const contact = await prisma.contact.findFirst({ where: { id: contactId, userId } });
      if (contact) finalName = contact.name;
    }

    const variations = await AIService.generateMessageVariations({
      userId,
      recipientName: finalName || 'bạn',
      topic,
      context,
      tone,
      length,
      action,
    });

    // Lưu bản nháp (MessageDraft)
    const draft = await prisma.messageDraft.create({
      data: {
        userId,
        contactId: contactId || null,
        rawPrompt: topic,
        context: context || null,
        tone,
        length,
        generatedOptions: JSON.stringify(variations),
        selectedOption: variations[0] || null,
      },
    });

    // Ghi log hoạt động
    await prisma.activityLog.create({
      data: {
        userId,
        actionType: 'AI_GENERATE',
        content: variations[0] || topic,
        recipientName: finalName || 'Người nhận',
        contactId: contactId || null,
        processingMethod: 'DRAFT_ONLY',
        status: 'DRAFT',
        metadata: JSON.stringify({
          tone,
          length,
          draftId: draft.id,
          totalOptions: variations.length,
        }),
      },
    });

    res.json({
      success: true,
      data: {
        draftId: draft.id,
        variations,
        tone,
        length,
        recipientName: finalName,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const analyzeConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { conversationText, intimacyLevel = 3, desiredTone = 'FRIENDLY' } = req.body;

    if (!conversationText) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp nội dung cuộc trò chuyện để phân tích' });
      return;
    }

    const analysis = await AIService.analyzeConversation({
      userId,
      conversationText,
      intimacyLevel: Number(intimacyLevel),
      desiredTone,
    });

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDrafts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const drafts = await prisma.messageDraft.findMany({
      where: { userId },
      include: { contact: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: drafts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
