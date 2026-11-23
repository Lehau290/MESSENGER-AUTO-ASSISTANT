import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'messenger_auto_assistant_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email này đã được đăng ký tài khoản' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        aiSetting: {
          create: {
            provider: 'GEMINI',
            modelName: 'gemini-1.5-flash',
            temperature: 0.7,
            maxTokens: 1000,
          },
        },
        preferences: {
          create: {
            theme: 'light',
            soundEnabled: true,
            autoLaunch: false,
            minimizeToTray: true,
            notifyDesktop: true,
          },
        },
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        preferences: true,
        aiSetting: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        preferences: user.preferences,
        aiSetting: user.aiSetting ? { ...user.aiSetting, apiKey: user.aiSetting.apiKey ? '***HIDDEN***' : null } : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        aiSetting: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        preferences: user.preferences,
        aiSetting: user.aiSetting ? { ...user.aiSetting, apiKey: user.aiSetting.apiKey ? '***HIDDEN***' : null } : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { fullName, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        avatarUrl,
      },
    });

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mới' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
