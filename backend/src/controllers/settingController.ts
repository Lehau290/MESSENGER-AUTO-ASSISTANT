import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    let aiSetting = await prisma.aISetting.findUnique({ where: { userId } });
    if (!aiSetting) {
      aiSetting = await prisma.aISetting.create({
        data: {
          userId,
          provider: 'GEMINI',
          modelName: 'gemini-1.5-flash',
          temperature: 0.7,
          maxTokens: 1000,
        },
      });
    }

    let preferences = await prisma.userPreference.findUnique({ where: { userId } });
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          soundEnabled: true,
          autoLaunch: false,
          minimizeToTray: true,
          notifyDesktop: true,
        },
      });
    }

    res.json({
      success: true,
      data: {
        aiSetting: {
          ...aiSetting,
          apiKey: aiSetting.apiKey ? '***HIDDEN***' : '',
          hasKey: Boolean(aiSetting.apiKey),
        },
        preferences,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAISetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { provider, apiKey, customEndpoint, modelName, temperature, maxTokens, systemPrompt } = req.body;

    const dataToUpdate: any = {
      provider,
      customEndpoint,
      modelName,
      temperature: temperature !== undefined ? Number(temperature) : undefined,
      maxTokens: maxTokens !== undefined ? Number(maxTokens) : undefined,
      systemPrompt,
    };

    // Chỉ cập nhật apiKey nếu người dùng nhập mới và không phải mask '***HIDDEN***'
    if (apiKey && apiKey !== '***HIDDEN***') {
      dataToUpdate.apiKey = apiKey.trim();
    } else if (apiKey === '') {
      dataToUpdate.apiKey = null;
    }

    const updated = await prisma.aISetting.upsert({
      where: { userId },
      update: dataToUpdate,
      create: {
        userId,
        ...dataToUpdate,
      },
    });

    res.json({
      success: true,
      message: 'Lưu cấu hình AI thành công',
      data: {
        ...updated,
        apiKey: updated.apiKey ? '***HIDDEN***' : '',
        hasKey: Boolean(updated.apiKey),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { theme, soundEnabled, autoLaunch, minimizeToTray, notifyDesktop, reminderSound } = req.body;

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        theme,
        soundEnabled,
        autoLaunch,
        minimizeToTray,
        notifyDesktop,
        reminderSound,
      },
      create: {
        userId,
        theme: theme || 'light',
        soundEnabled: soundEnabled !== undefined ? soundEnabled : true,
        autoLaunch: Boolean(autoLaunch),
        minimizeToTray: minimizeToTray !== undefined ? minimizeToTray : true,
        notifyDesktop: notifyDesktop !== undefined ? notifyDesktop : true,
        reminderSound: reminderSound || 'bell',
      },
    });

    res.json({ success: true, message: 'Cập nhật tùy chọn ứng dụng thành công', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportUserData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    const [contacts, templates, schedules, rules, logs, preferences] = await Promise.all([
      prisma.contact.findMany({ where: { userId } }),
      prisma.messageTemplate.findMany({ where: { userId } }),
      prisma.scheduledMessage.findMany({ where: { userId } }),
      prisma.automationRule.findMany({ where: { userId } }),
      prisma.activityLog.findMany({ where: { userId }, take: 100 }),
      prisma.userPreference.findUnique({ where: { userId } }),
    ]);

    const backupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        contacts,
        templates,
        schedules,
        rules,
        logs,
        preferences,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=messenger-assistant-backup-${Date.now()}.json`);
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
