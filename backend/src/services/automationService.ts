import { prisma } from '../config/db';

export class AutomationService {
  /**
   * Khớp tin nhắn với các kịch bản tự động của người dùng
   */
  static async evaluateRules(userId: string, incomingText: string): Promise<{
    matched: boolean;
    rule?: any;
    replyContent?: string;
    isWithinActiveHours: boolean;
    reason?: string;
  }> {
    const rules = await prisma.automationRule.findMany({
      where: {
        userId,
        isEnabled: true,
      },
      orderBy: {
        priority: 'desc',
      },
    });

    if (rules.length === 0) {
      return { matched: false, isWithinActiveHours: true, reason: 'Chưa có kịch bản kích hoạt nào.' };
    }

    const now = new Date();
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const cleanText = incomingText.trim().toLowerCase();

    for (const rule of rules) {
      // Kiểm tra khung giờ hoạt động
      let isWithinHours = true;
      if (rule.activeHoursStart && rule.activeHoursEnd) {
        if (rule.activeHoursStart <= rule.activeHoursEnd) {
          isWithinHours = currentHourMin >= rule.activeHoursStart && currentHourMin <= rule.activeHoursEnd;
        } else {
          // Vắt qua nửa đêm (ví dụ: 22:00 -> 06:00)
          isWithinHours = currentHourMin >= rule.activeHoursStart || currentHourMin <= rule.activeHoursEnd;
        }
      }

      if (!isWithinHours) {
        continue;
      }

      // Tách các từ khóa (hỗ trợ phân cách bằng dấu phẩy)
      const keywords = rule.keywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      let isMatch = false;

      for (const kw of keywords) {
        if (rule.triggerCondition === 'EXACT' && cleanText === kw) {
          isMatch = true;
          break;
        } else if (rule.triggerCondition === 'STARTS_WITH' && cleanText.startsWith(kw)) {
          isMatch = true;
          break;
        } else if (rule.triggerCondition === 'REGEX') {
          try {
            const regex = new RegExp(kw, 'i');
            if (regex.test(cleanText)) {
              isMatch = true;
              break;
            }
          } catch {
            // Regex invalid, skip
          }
        } else {
          // Default CONTAINS
          if (cleanText.includes(kw)) {
            isMatch = true;
            break;
          }
        }
      }

      if (isMatch) {
        // Tăng đếm số lần kích hoạt
        await prisma.automationRule.update({
          where: { id: rule.id },
          data: { executionCount: { increment: 1 } },
        });

        return {
          matched: true,
          rule,
          replyContent: rule.replyContent,
          isWithinActiveHours: true,
        };
      }
    }

    return {
      matched: false,
      isWithinActiveHours: true,
      reason: 'Không có từ khóa kịch bản nào khớp với tin nhắn.',
    };
  }
}
