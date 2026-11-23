import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { category, search } = req.query;

    const where: any = { userId };
    if (category && category !== 'ALL') {
      where.category = String(category);
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { content: { contains: String(search) } },
        { tags: { contains: String(search) } },
      ];
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: [{ isFavorite: 'desc' }, { usageCount: 'desc' }, { updatedAt: 'desc' }],
    });

    res.json({ success: true, data: templates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { title, category, content, tags, isFavorite } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề, danh mục và nội dung mẫu' });
      return;
    }

    const template = await prisma.messageTemplate.create({
      data: {
        userId,
        title,
        category,
        content,
        tags,
        isFavorite: Boolean(isFavorite),
      },
    });

    res.status(201).json({ success: true, message: 'Đã tạo mẫu tin nhắn mới', data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const { title, category, content, tags, isFavorite } = req.body;

    await prisma.messageTemplate.updateMany({
      where: { id, userId },
      data: {
        title,
        category,
        content,
        tags,
        isFavorite,
      },
    });

    const updated = await prisma.messageTemplate.findUnique({ where: { id } });
    res.json({ success: true, message: 'Cập nhật mẫu thành công', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    await prisma.messageTemplate.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Đã xóa mẫu tin nhắn' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    const source = await prisma.messageTemplate.findFirst({ where: { id, userId } });
    if (!source) {
      res.status(404).json({ success: false, message: 'Không tìm thấy mẫu tin nhắn' });
      return;
    }

    const duplicated = await prisma.messageTemplate.create({
      data: {
        userId,
        title: `${source.title} (Bản sao)`,
        category: source.category,
        content: source.content,
        tags: source.tags,
        isFavorite: false,
      },
    });

    res.status(201).json({ success: true, message: 'Nhân bản mẫu tin nhắn thành công', data: duplicated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const useTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const { recipientName = 'bạn' } = req.body;

    const template = await prisma.messageTemplate.findFirst({ where: { id, userId } });
    if (!template) {
      res.status(404).json({ success: false, message: 'Không tìm thấy mẫu' });
      return;
    }

    // Tăng đếm sử dụng
    await prisma.messageTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    // Thay thế biến {name}, {time_greeting}
    const currentHour = new Date().getHours();
    let timeGreeting = 'Chào bạn';
    if (currentHour >= 5 && currentHour < 11) timeGreeting = 'Chào buổi sáng';
    else if (currentHour >= 11 && currentHour < 14) timeGreeting = 'Chào buổi trưa';
    else if (currentHour >= 14 && currentHour < 18) timeGreeting = 'Chào buổi chiều';
    else timeGreeting = 'Chào buổi tối';

    let resolvedContent = template.content
      .replace(/{name}/gi, recipientName)
      .replace(/{time_greeting}/gi, timeGreeting);

    res.json({
      success: true,
      data: {
        originalContent: template.content,
        resolvedContent,
        title: template.title,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
