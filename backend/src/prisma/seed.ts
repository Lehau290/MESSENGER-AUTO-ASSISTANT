import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Đang tạo dữ liệu mẫu khởi tạo...');

  // 1. Tạo User mặc định
  const passwordHash = await bcrypt.hash('Password123@', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@messenger.vn' },
    update: {},
    create: {
      email: 'admin@messenger.vn',
      passwordHash,
      fullName: 'Quản trị viên',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'ADMIN',
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
          reminderSound: 'bell',
        },
      },
    },
  });

  console.log(`[Seed] User khởi tạo thành công: ${user.email} (Mật khẩu: Password123@)`);

  // 2. Tạo danh bạ mẫu
  const contactsData = [
    {
      name: 'Nguyễn Thu Trang',
      fbUsername: 'thutrang.nguyen.99',
      relationshipType: 'CRUSH',
      notes: 'Thích hoa cúc họa mi, hay online buổi tối sau 9h.',
      phone: '0912345678',
      tags: 'quan_trong,tinh_cam',
      isFavorite: true,
    },
    {
      name: 'Trần Minh Quân',
      fbUsername: 'quan.tran.dev',
      relationshipType: 'WORK',
      notes: 'Team Lead dự án Web. Trao đổi công việc chuyên nghiệp.',
      phone: '0987654321',
      tags: 'cong_ty,du_an',
      isFavorite: true,
    },
    {
      name: 'Mẹ Yêu',
      fbUsername: 'me.yeu.family',
      relationshipType: 'FAMILY',
      notes: 'Nhắc mẹ uống thuốc huyết áp lúc 8h sáng.',
      phone: '0903112233',
      tags: 'gia_dinh,uu_tien',
      isFavorite: true,
    },
    {
      name: 'Lê Hoàng Nam',
      fbUsername: 'nam.le.gym',
      relationshipType: 'FRIEND',
      notes: 'Bạn thân đại học, hay rủ đi đánh cầu lông cuối tuần.',
      phone: '0934567890',
      tags: 'ban_than,the_thao',
      isFavorite: false,
    },
    {
      name: 'Khách hàng - Chị Mai',
      fbUsername: 'mai.boutique',
      relationshipType: 'WORK',
      notes: 'Đối tác ký hợp đồng dịch vụ marketing.',
      phone: '0977889900',
      tags: 'khach_hang,vip',
      isFavorite: false,
    },
  ];

  const createdContacts = [];
  for (const c of contactsData) {
    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        ...c,
      },
    });
    createdContacts.push(contact);
  }

  // 3. Tạo mẫu tin nhắn đa dạng
  const templatesData = [
    {
      title: 'Chào buổi sáng năng lượng',
      category: 'MORNING',
      content: '{time_greeting} {name}! Chúc bạn một ngày mới tràn ngập niềm vui, may mắn và công việc hanh thông nhé! ☀️✨',
      tags: 'buoi_sang,chuc_mung',
      isFavorite: true,
      usageCount: 12,
    },
    {
      title: 'Chúc ngủ ngon ấm áp',
      category: 'NIGHT',
      content: 'Đã muộn rồi nè {name}, gác lại công việc và nghỉ ngơi thôi. Chúc bạn ngủ thật ngon và mơ những giấc mơ thật đẹp nhé! 🌙⭐',
      tags: 'ngu_ngon,quan_tam',
      isFavorite: true,
      usageCount: 18,
    },
    {
      title: 'Hỏi thăm bạn bè lâu ngày',
      category: 'GREETING',
      content: 'Chào {name}! Lâu rồi tụi mình chưa trò chuyện nè, dạo này bạn vẫn khỏe và công việc tốt chứ? Khi nào rảnh cà phê nhé! ☕🌻',
      tags: 'ban_be,hoi_tham',
      isFavorite: false,
      usageCount: 8,
    },
    {
      title: 'Chúc mừng sinh nhật ý nghĩa',
      category: 'BIRTHDAY',
      content: 'Chúc mừng sinh nhật {name}! 🎂🎉 Chúc bạn tuổi mới luôn rạng rỡ, ngập tràn hạnh phúc và gặt hái thêm nhiều thành công rực rỡ nhé!',
      tags: 'sinh_nhat,chuc_mung',
      isFavorite: true,
      usageCount: 15,
    },
    {
      title: 'Xin lỗi chân thành',
      category: 'APOLOGY',
      content: 'Chào {name}, mình rất xin lỗi vì sự bất tiện vừa rồi. Mình đã ghi nhận và sẽ xử lý ngay lập tức. Mong bạn rộng lòng thông cảm giúp mình nhé! 🙏',
      tags: 'xin_loi,lich_su',
      isFavorite: false,
      usageCount: 4,
    },
    {
      title: 'Cảm ơn sự hỗ trợ',
      category: 'THANKS',
      content: 'Cảm ơn {name} rất nhiều vì đã nhiệt tình hỗ trợ mình hôm nay nhé! Có bạn đồng hành mọi thứ suôn sẻ hơn hẳn luôn á. ❤️✨',
      tags: 'cam_on,dong_nghiep',
      isFavorite: true,
      usageCount: 9,
    },
    {
      title: 'Xác nhận tiến độ công việc',
      category: 'WORK',
      content: 'Chào {name}, tôi gửi bạn bản cập nhật tiến độ công việc hôm nay. Nhờ bạn xem qua và phản hồi sớm giúp tôi nhé. Trân trọng!',
      tags: 'cong_viec,chuyen_nghiep',
      isFavorite: false,
      usageCount: 11,
    },
    {
      title: 'Nhắn gửi ngọt ngào',
      category: 'ROMANCE',
      content: '{name} ơi, đang làm gì đó? Tự nhiên thấy nhớ bạn quá chừng. Nhớ ăn uống đầy đủ và giữ gìn sức khỏe nha tình yêu! 💖🌸',
      tags: 'tinh_cam,ngot_ngao',
      isFavorite: true,
      usageCount: 22,
    },
  ];

  for (const t of templatesData) {
    await prisma.messageTemplate.create({
      data: {
        userId: user.id,
        ...t,
      },
    });
  }

  // 4. Tạo lịch gửi mẫu
  const in30Minutes = new Date(Date.now() + 30 * 60 * 1000);
  const tomorrowMorning = new Date();
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(8, 0, 0, 0);

  if (createdContacts.length >= 2) {
    await prisma.scheduledMessage.create({
      data: {
        userId: user.id,
        contactId: createdContacts[0].id,
        content: 'Chúc em một buổi sáng vui vẻ và làm việc hiệu quả nhé! Nhớ uống nhiều nước nha ☕❤️',
        scheduledAt: in30Minutes,
        recurrenceType: 'DAILY',
        status: 'PENDING',
      },
    });

    await prisma.scheduledMessage.create({
      data: {
        userId: user.id,
        contactId: createdContacts[1].id,
        content: 'Chào anh Quân, em xin gửi bản báo cáo tiến độ tuần này qua email, nhờ anh duyệt giúp em nhé ạ.',
        scheduledAt: tomorrowMorning,
        recurrenceType: 'WEEKLY',
        status: 'PENDING',
      },
    });
  }

  // 5. Tạo kịch bản tự động mẫu
  const rulesData = [
    {
      name: 'Chào hỏi tự động',
      keywords: 'xin chào,chào bạn,hello,hi,alo',
      replyContent: 'Chào bạn! Rất vui được trò chuyện cùng bạn. Hôm nay của bạn thế nào rồi nè? 😊',
      triggerCondition: 'CONTAINS',
      activeHoursStart: '08:00',
      activeHoursEnd: '22:00',
      isEnabled: true,
      matchType: 'SUGGEST',
      priority: 10,
    },
    {
      name: 'Hỏi thăm công việc',
      keywords: 'bạn đang làm gì,đang làm gì đấy,đang bận không',
      replyContent: 'Mình đang xử lý một chút công việc trên máy tính nè, còn bạn thì sao? Có gì vui kể mình nghe với!',
      triggerCondition: 'CONTAINS',
      activeHoursStart: '09:00',
      activeHoursEnd: '21:00',
      isEnabled: true,
      matchType: 'SUGGEST',
      priority: 8,
    },
    {
      name: 'Chúc ngủ ngon ban đêm',
      keywords: 'chúc ngủ ngon,ngủ ngon,good night,đi ngủ đây',
      replyContent: 'Chúc bạn ngủ thật ngon và có những giấc mơ thật đẹp nhé! Sáng mai thức dậy tràn đầy năng lượng 🌙💤',
      triggerCondition: 'CONTAINS',
      activeHoursStart: '22:00',
      activeHoursEnd: '06:00',
      isEnabled: true,
      matchType: 'SUGGEST',
      priority: 9,
    },
  ];

  for (const r of rulesData) {
    await prisma.automationRule.create({
      data: {
        userId: user.id,
        ...r,
      },
    });
  }

  // 6. Tạo Activity Logs mẫu với trạng thái rõ ràng
  const sampleLogs = [
    {
      actionType: 'MANUAL_SENT_CONFIRMED',
      content: 'Chào buổi sáng Thu Trang! Chúc một ngày tuyệt vời nhé.',
      recipientName: 'Nguyễn Thu Trang',
      contactId: createdContacts[0]?.id,
      processingMethod: 'MANUAL_CONFIRMED',
      status: 'CONFIRMED_MANUAL_SENT',
    },
    {
      actionType: 'AI_GENERATE',
      content: 'Anh Quân ơi, nhờ anh check giúp em email báo cáo nhé.',
      recipientName: 'Trần Minh Quân',
      contactId: createdContacts[1]?.id,
      processingMethod: 'DRAFT_ONLY',
      status: 'DRAFT',
    },
    {
      actionType: 'SCHEDULE_REMIND',
      content: 'Mẹ nhớ uống thuốc huyết áp lúc 8h sáng nhé ạ.',
      recipientName: 'Mẹ Yêu',
      contactId: createdContacts[2]?.id,
      processingMethod: 'MANUAL_CONFIRMED',
      status: 'PENDING_CONFIRMATION',
    },
  ];

  for (const log of sampleLogs) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        ...log,
      },
    });
  }

  console.log('[Seed] Dữ liệu mẫu đã được nạp hoàn tất và sẵn sàng!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
