import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getIntegrationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;

    let integration = await prisma.integration.findFirst({
      where: { userId, platform: 'META_MESSENGER' },
    });

    if (!integration) {
      integration = await prisma.integration.create({
        data: {
          userId,
          platform: 'META_MESSENGER',
          isConnected: false,
          status: 'DISCONNECTED',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: integration.id,
        platform: integration.platform,
        isConnected: integration.isConnected,
        status: integration.status,
        appId: integration.appId ? '***CONFIGURED***' : null,
        hasPageToken: Boolean(integration.pageToken),
        webhookUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/integrations/webhook`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIntegration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { appId, appSecret, pageToken, webhookSecret, verifyToken, isConnected } = req.body;

    const dataToUpdate: any = {
      appId,
      verifyToken,
      isConnected: Boolean(isConnected),
      status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
    };

    if (appSecret) dataToUpdate.appSecret = appSecret;
    if (pageToken) dataToUpdate.pageToken = pageToken;
    if (webhookSecret) dataToUpdate.webhookSecret = webhookSecret;

    const integration = await prisma.integration.upsert({
      where: {
        id: req.body.id || 'non_existent_id',
      },
      update: dataToUpdate,
      create: {
        userId,
        platform: 'META_MESSENGER',
        ...dataToUpdate,
      },
    });

    res.json({
      success: true,
      message: 'Cập nhật cấu hình tích hợp Meta thành công',
      data: {
        isConnected: integration.isConnected,
        status: integration.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Endpoint xác thực Webhook Meta chính thức (Hub Challenge)
 */
export const verifyMetaWebhook = (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.META_VERIFY_TOKEN || 'messenger_auto_assistant_verify_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[Meta Webhook] Xác thực Webhook Meta thành công!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

/**
 * Xử lý webhook events từ Meta Messenger
 */
export const handleMetaWebhookEvents = async (req: Request, res: Response): Promise<void> => {
  const body = req.body;

  if (body.object === 'page') {
    // Luôn trả về 200 OK ngay lập tức theo yêu cầu của Meta
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
};
