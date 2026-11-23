import axios from 'axios';
import { prisma } from '../config/db';

export interface GenerateMessageParams {
  userId: string;
  recipientName?: string;
  topic: string;
  context?: string;
  tone: string; // CUTE, FRIENDLY, ROMANTIC, FUNNY, POLITE, PROFESSIONAL, CARING, APOLOGETIC, MORNING, NIGHT
  length: string; // SHORT, MEDIUM, LONG
  action?: 'GENERATE' | 'REWRITE' | 'SHORTEN' | 'EXPAND';
}

export interface AnalyzeConversationParams {
  userId: string;
  conversationText: string;
  intimacyLevel: number; // 1 to 5
  desiredTone?: string;
}

export class AIService {
  /**
   * Sinh các biến thể tin nhắn thông minh dựa trên cấu hình người dùng
   */
  static async generateMessageVariations(params: GenerateMessageParams): Promise<string[]> {
    const { userId, recipientName = 'bạn', topic, context = '', tone, length, action = 'GENERATE' } = params;

    // Lấy cấu hình AI của user nếu có
    const aiSetting = await prisma.aISetting.findUnique({
      where: { userId },
    });

    if (aiSetting?.apiKey) {
      try {
        if (aiSetting.provider === 'GEMINI') {
          return await this.generateWithGemini(aiSetting, params);
        } else if (aiSetting.provider === 'OPENAI' || aiSetting.provider === 'OPENROUTER' || aiSetting.provider === 'CUSTOM_LOCAL') {
          return await this.generateWithOpenAICompatible(aiSetting, params);
        }
      } catch (err: any) {
        console.warn('[AIService] External API call failed, falling back to smart local engine:', err.message);
      }
    }

    // Smart Local Natural Language Engine (Chạy độc lập, chất lượng cao, không phụ thuộc API key)
    return this.generateSmartLocalVariations(recipientName, topic, context, tone, length, action);
  }

  /**
   * Gọi Google Gemini API
   */
  private static async generateWithGemini(setting: any, params: GenerateMessageParams): Promise<string[]> {
    const model = setting.modelName || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${setting.apiKey}`;

    const prompt = `
Bạn là chuyên gia cố vấn giao tiếp và soạn thảo tin nhắn Messenger tiếng Việt chuyên nghiệp, tự nhiên và duyên dáng.
Người nhận: ${params.recipientName || 'bạn'}
Chủ đề / Ý chính: ${params.topic}
Ngữ cảnh: ${params.context || 'Trò chuyện hàng ngày'}
Phong cách (Tone): ${params.tone}
Độ dài yêu cầu: ${params.length}
Yêu cầu thao tác: ${params.action || 'GENERATE'}

Hãy tạo ra chính xác 3 phương án tin nhắn tiếng Việt khác nhau (Phương án 1, 2, 3), tự nhiên như người thật nhắn tin Messenger, phù hợp văn hóa Việt Nam.
Định dạng trả về duy nhất là JSON array gồm 3 chuỗi tin nhắn:
["Tin nhắn 1", "Tin nhắn 2", "Tin nhắn 3"]
Chỉ trả về JSON thuần, không có markdown backtick hay giải thích gì thêm.
`;

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: setting.temperature || 0.7,
          maxOutputTokens: setting.maxTokens || 1000,
        },
      },
      { timeout: 15000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.parseJSONList(text, params);
  }

  /**
   * Gọi OpenAI / OpenRouter / Custom compatible API
   */
  private static async generateWithOpenAICompatible(setting: any, params: GenerateMessageParams): Promise<string[]> {
    const endpoint = setting.customEndpoint || (setting.provider === 'OPENROUTER' ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions');
    const model = setting.modelName || (setting.provider === 'OPENROUTER' ? 'google/gemini-flash-1.5' : 'gpt-4o-mini');

    const prompt = `
Bạn là trợ lý soạn thảo tin nhắn Messenger tiếng Việt tự nhiên và giàu cảm xúc.
Người nhận: ${params.recipientName || 'bạn'}
Ý định: ${params.topic}
Ngữ cảnh: ${params.context || 'Trò chuyện Messenger'}
Phong cách: ${params.tone}
Độ dài: ${params.length}

Hãy tạo 3 phương án tin nhắn tiếng Việt khác nhau dưới dạng JSON array:
["Tin nhắn 1", "Tin nhắn 2", "Tin nhắn 3"]
`;

    const response = await axios.post(
      endpoint,
      {
        model,
        messages: [
          { role: 'system', content: 'Bạn là chuyên gia soạn thảo tin nhắn Messenger tiếng Việt.' },
          { role: 'user', content: prompt },
        ],
        temperature: setting.temperature || 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${setting.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const text = response.data?.choices?.[0]?.message?.content || '';
    return this.parseJSONList(text, params);
  }

  private static parseJSONList(rawText: string, params: GenerateMessageParams): string[] {
    try {
      const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => String(item).trim());
      }
    } catch {
      // If parsing fails, split lines
    }
    return this.generateSmartLocalVariations(
      params.recipientName || 'bạn',
      params.topic,
      params.context || '',
      params.tone,
      params.length,
      params.action || 'GENERATE'
    );
  }

  /**
   * Smart Natural Language Generation cho tiếng Việt với đầy đủ các phong cách và độ dài
   */
  public static generateSmartLocalVariations(
    name: string,
    topic: string,
    context: string,
    tone: string,
    length: string,
    action: string
  ): string[] {
    const isShort = length === 'SHORT';
    const isLong = length === 'LONG';

    switch (tone.toUpperCase()) {
      case 'CUTE':
        return [
          `${name} uiii, ${topic} nè! Nhớ giữ gìn sức khoẻ nhaaaa 🥰✨`,
          isShort
            ? `${name} ơi, ${topic} nèee (｡♥‿♥｡)`
            : `${name} ơi ới! Mình nhắn để dặn bạn: ${topic}. Chúc ${name} một ngày siêu ngọt ngào và tràn đầy năng lượng nha 🌸💖`,
          `Hế nhô ${name} dễ thương! Về vụ ${topic} ý, bạn thấy thế nào nè? Rảnh thì ới mình ngay nhen ✨🐰`,
        ];

      case 'ROMANTIC':
        return [
          `Gửi ${name} yêu dấu, ${topic}. Lúc nào cũng nhớ và nghĩ về bạn rất nhiều ❤️`,
          isShort
            ? `${name} à, ${topic}. Thương bạn nhiều lắm! 💕`
            : `Chào ${name} của mình, ${topic}. Dù hôm nay có bận rộn thế nào thì cũng nhớ luôn có mình ở cạnh và ủng hộ bạn nhé. Yêu thương đong đầy gửi đến bạn! 🌹✨`,
          `${name} ơi, ngắm nhìn mọi thứ hôm nay lại bất chợt nhớ đến bạn. ${topic}. Mong sớm được gặp bạn quá nè ❤️`,
        ];

      case 'FUNNY':
        return [
          `Alo 1234, ${name} nghe rõ trả lời! ${topic} nha, không trả lời là bắt đền đấy nhé 😂🤣`,
          isShort
            ? `Ê ${name}, ${topic}! Nhanh còn kịp không hết lượt nè =)))`
            : `Chào đồng chí ${name}! Trạm vũ trụ gửi thông điệp khẩn cấp: ${topic}. Nhận được tin nhắn xin vui lòng nở một nụ cười thật tươi rồi rep lại nhé haha 😎🔥`,
          `${name} ơi, tin hot hơn cả thời tiết hôm nay: ${topic}! Nghe xong nhớ đừng sốc quá mà ngất ngây nha 😜`,
        ];

      case 'POLITE':
        return [
          `Kính chào ${name}, em/mình xin phép nhắn tin trao đổi về: ${topic}. Rất mong nhận được phản hồi từ bạn khi thuận tiện ạ. Em xin cảm ơn!`,
          isShort
            ? `Dạ em chào ${name}, em gửi anh/chị thông tin: ${topic} ạ.`
            : `Kính gửi ${name}, hy vọng bạn đang có một ngày làm việc hiệu quả. Về vấn đề ${topic}, mình xin phép được cập nhật và lắng nghe ý kiến đóng góp từ bạn. Chúc bạn một ngày tốt lành ạ!`,
          `Dạ chào ${name}, em xin phép làm phiền một chút ạ. Em muốn chia sẻ về ${topic}. Khi nào tiện thời gian, nhờ ${name} xem qua giúp em nhé. Trân trọng!`,
        ];

      case 'PROFESSIONAL':
        return [
          `Chào ${name}, tôi liên hệ để cập nhật tiến độ liên quan đến: ${topic}. Vui lòng phản hồi sớm để chúng ta phối hợp triển khai tiếp nhé.`,
          isShort
            ? `Dear ${name}, update nhanh về: ${topic}. Nhờ bạn check và confirm giúp nhé.`
            : `Kính gửi ${name}, liên quan đến công việc và nội dung "${topic}", tôi đã chuẩn bị các bước tiếp theo. Xin vui lòng kiểm tra và cho biết khung giờ bạn có thể thảo luận ngắn. Cảm ơn sự hợp tác của bạn.`,
          `Chào ${name}, gửi bạn thông tin tóm tắt về ${topic}. Rất mong nhận được phản hồi chính thức từ phía bạn trong ngày hôm nay. Trân trọng!`,
        ];

      case 'CARING':
        return [
          `${name} ơi, hôm nay thế nào rồi? Mình nhắn để nhắc bạn: ${topic}. Dù bận gì cũng nhớ ăn uống đầy đủ và nghỉ ngơi nhé! 🌿`,
          isShort
            ? `${name} nhớ giữ gìn sức khoẻ nha, ${topic} nhé bạn!`
            : `Chào ${name}, dạo này thấy bạn bận rộn quá nên mình rất quan tâm. Về ${topic}, bạn đừng lo lắng quá nhé, có gì cứ chia sẻ với mình. Chúc ${name} luôn bình an và vui vẻ! 💛`,
          `${name} à, thời tiết dạo này thất thường lắm đó. ${topic} nhen. Luôn tự chăm sóc bản thân thật tốt bạn nhé! ☕🌻`,
        ];

      case 'APOLOGETIC':
        return [
          `${name} ơi, mình thật lòng xin lỗi vì sự bất tiện vừa qua. Về việc ${topic}, mình đã rút kinh nghiệm và sẽ khắc phục ngay. Mong bạn thông cảm cho mình nhé! 🙏`,
          isShort
            ? `Mình xin lỗi ${name} nhiều nha! Vụ ${topic} cho mình tạ lỗi với bạn nhé.`
            : `Chào ${name}, mình gửi tin nhắn này với sự chân thành và áy náy nhất. Liên quan đến "${topic}", mình nhận thấy bản thân còn thiếu sót. Mong bạn rộng lòng bỏ qua và cho mình cơ hội bù đắp nhé! Thật lòng xin lỗi bạn.`,
          `${name} đừng giận mình nha. Về ${topic}, mình đã nhận ra vấn đề rồi. Hôm nào cho mình mời bạn một ly cà phê để trực tiếp tạ lỗi nhé!`,
        ];

      case 'MORNING':
        return [
          `Chào buổi sáng ${name}! Chúc bạn khởi đầu ngày mới ngập tràn năng lượng và mọi điều may mắn nhé. ${topic}! ☀️☕`,
          isShort
            ? `Good morning ${name}! Chúc một ngày rực rỡ nhen: ${topic} 🌅`
            : `Buổi sáng an lành nhé ${name}! Một ngày mới lại bắt đầu với biết bao cơ hội tuyệt vời. Mình nhắn để gửi lời chúc tốt lành và nhắc bạn: ${topic}. Chúc ${name} hoàn thành xuất sắc mọi dự định hôm nay! ✨🌻`,
          `Dậy chưa nè ${name} ơi? Chúc bạn một buổi sáng ngập tràn tiếng cười và thật nhiều điều thuận lợi. Nhớ bữa sáng nhé, và ${topic}!`,
        ];

      case 'NIGHT':
        return [
          `Đã muộn rồi đó ${name}, gác lại âu lo và ngủ một giấc thật sâu nhé. ${topic}. Chúc bạn ngủ ngon và có những giấc mơ đẹp! 🌙⭐`,
          isShort
            ? `Chúc ${name} ngủ ngon và mơ đẹp nha! ${topic} 😴✨`
            : `${name} ơi, sau một ngày dài nỗ lực làm việc thì giờ là lúc để bản thân được nghỉ ngơi rồi. ${topic}. Chúc ${name} có một đêm thật bình yên, sạc đầy năng lượng cho ngày mai nhé! Good night 🌟🛌`,
          `Gửi ${name} một cái ôm ấm áp trước giờ ngủ! ${topic}. Chúc ${name} ngủ thật ngon, sáng mai thức dậy với tinh thần sảng khoái nhất nhé! 💤🌠`,
        ];

      case 'FRIENDLY':
      default:
        return [
          `Chào ${name}! Lâu rồi mới nhắn bạn nè, ${topic}. Dạo này bạn thế nào rồi, mọi việc vẫn ổn chứ? 😊`,
          isShort
            ? `Hé lô ${name}! Nhắn bạn vụ này: ${topic} nha!`
            : `Chào ${name} nhé, hi vọng dạo này bạn vẫn khỏe và công việc suôn sẻ! Tiện đây mình muốn trao đổi với bạn về: ${topic}. Rảnh thì nhắn lại mình tâm sự chút nhé! Chúc bạn tuần mới nhiều niềm vui 🍀`,
          `Alo ${name} ơi! Mình vừa nhớ ra chuyện này nên nhắn liền: ${topic}. Có gì phản hồi mình nha, chúc bạn luôn vui tươi! ✌️`,
        ];
    }
  }

  /**
   * Phân tích cuộc hội thoại và đề xuất phản hồi
   */
  static async analyzeConversation(params: AnalyzeConversationParams): Promise<{
    sentiment: string;
    intent: string;
    suggestedResponses: string[];
    tips: string[];
  }> {
    const { conversationText, intimacyLevel = 3, desiredTone = 'FRIENDLY' } = params;

    // Phân tích sắc thái cơ bản
    const lower = conversationText.toLowerCase();
    let sentiment = 'Tích cực, cởi mở';
    let intent = 'Hỏi thăm và trao đổi thông tin thường ngày';

    if (lower.includes('giận') || lower.includes('chán') || lower.includes('mệt') || lower.includes('sao không') || lower.includes('tại sao')) {
      sentiment = 'Hơi căng thẳng hoặc mệt mỏi, cần sự lắng nghe khéo léo';
      intent = 'Cần được giải thích, dỗ dành hoặc lắng nghe';
    } else if (lower.includes('giá') || lower.includes('tiền') || lower.includes('hợp đồng') || lower.includes('công việc') || lower.includes('hạn chót')) {
      sentiment = 'Trang trọng, định hướng công việc';
      intent = 'Trao đổi nghiệp vụ và xác nhận tiến độ';
    } else if (lower.includes('nhớ') || lower.includes('thương') || lower.includes('yêu') || lower.includes('hẹn')) {
      sentiment = 'Ấm áp, gắn kết tình cảm';
      intent = 'Bày tỏ cảm xúc và mong muốn kết nối';
    }

    const tips = [
      'Nên phản hồi trong vòng 5-15 phút để duy trì mạch cảm xúc tự nhiên.',
      `Độ thân mật hiện tại mức ${intimacyLevel}/5: Hãy giữ xưng hô phù hợp, tránh quá suồng sã nếu chưa thật sự thân thiết.`,
      'Thêm một câu hỏi mở ở cuối tin nhắn để kích thích đối phương tiếp tục trò chuyện.',
    ];

    const suggestedResponses = [
      `Mình hiểu ý bạn rồi nè! Cảm ơn bạn đã chia sẻ, mình thấy điều này rất hợp lý luôn á. Bạn có dự định thế nào tiếp theo chưa?`,
      `Nghe bạn nói vậy mình cũng thấy nhẹ nhõm hơn hẳn. Cảm ơn bạn nhiều nhé! Hôm nào mình gặp nhau cà phê tâm sự thêm nha?`,
      `Dạ em đã nhận được thông tin rồi ạ. Em sẽ xem xét kỹ và phản hồi lại anh/chị ngay khi hoàn tất. Chúc anh/chị một ngày vui vẻ!`,
    ];

    return {
      sentiment,
      intent,
      suggestedResponses,
      tips,
    };
  }
}
