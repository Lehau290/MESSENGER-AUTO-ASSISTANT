import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { search, relationship, isFavorite } = req.query;

    const where: any = { userId };

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { fbUsername: { contains: String(search) } },
        { notes: { contains: String(search) } },
        { phone: { contains: String(search) } },
      ];
    }

    if (relationship && relationship !== 'ALL') {
      where.relationshipType = String(relationship);
    }

    if (isFavorite === 'true') {
      where.isFavorite = true;
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
      include: {
        _count: {
          select: {
            scheduledMessages: true,
            drafts: true,
          },
        },
      },
    });

    res.json({ success: true, data: contacts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContactById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    const contact = await prisma.contact.findFirst({
      where: { id, userId },
      include: {
        scheduledMessages: {
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        drafts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        activityLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!contact) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người liên hệ' });
      return;
    }

    res.json({ success: true, data: contact });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { name, fbUsername, fbId, avatarUrl, relationshipType, phone, email, notes, tags, isFavorite } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Tên người liên hệ là bắt buộc' });
      return;
    }

    const contact = await prisma.contact.create({
      data: {
        userId,
        name,
        fbUsername: fbUsername ? fbUsername.replace(/^https:\/\/m\.me\//, '').replace(/^@/, '') : null,
        fbId,
        avatarUrl,
        relationshipType: relationshipType || 'FRIEND',
        phone,
        email,
        notes,
        tags,
        isFavorite: Boolean(isFavorite),
      },
    });

    res.status(201).json({ success: true, message: 'Thêm người liên hệ thành công', data: contact });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const { name, fbUsername, fbId, avatarUrl, relationshipType, phone, email, notes, tags, isFavorite } = req.body;

    const contact = await prisma.contact.updateMany({
      where: { id, userId },
      data: {
        name,
        fbUsername: fbUsername ? fbUsername.replace(/^https:\/\/m\.me\//, '').replace(/^@/, '') : null,
        fbId,
        avatarUrl,
        relationshipType,
        phone,
        email,
        notes,
        tags,
        isFavorite,
      },
    });

    if (contact.count === 0) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người liên hệ để cập nhật' });
      return;
    }

    const updated = await prisma.contact.findUnique({ where: { id } });
    res.json({ success: true, message: 'Cập nhật thành công', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    await prisma.contact.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Đã xóa người liên hệ' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFavoriteContact = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const id = req.params.id as string;

    const contact = await prisma.contact.findFirst({ where: { id, userId } });
    if (!contact) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người liên hệ' });
      return;
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: { isFavorite: !contact.isFavorite },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
