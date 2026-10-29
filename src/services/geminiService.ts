import axiosClient from '@api/axiosClient';

/** Cùng tinh thần ChatTurn Chương 8 — đơn giản hóa khi gửi Nest */
export type ChatTurn = {
  role: 'user' | 'model';
  parts?: { text: string }[];
  text?: string;
};

/** Gọi NestJS /api/ai/chat — Server cầm Gemini Key */
export const askShopAI = async (
  question: string,
  history: ChatTurn[] = [],
): Promise<string> => {
  const { data } = await axiosClient.post<{ reply: string }>('/api/ai/chat', {
    message: question,
    history: history.map((h) => ({
      role: h.role,
      text: h.parts?.[0]?.text ?? h.text ?? '',
    })),
  });
  return data.reply;
};

/** Chuyển thông báo lỗi kỹ thuật thành câu chữ mà người dùng đọc hiểu được. */
export const toFriendlyError = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('429')) return 'Trợ lý đang bận xử lý nhiều câu hỏi. Bạn đợi vài giây rồi thử lại nhé.';
  if (msg.includes('API key') || msg.includes('401') || msg.includes('403'))
    return 'Trợ lý AI đang trong chế độ dự phòng cục bộ.';
  if (msg.includes('bộ lọc an toàn')) return msg;

  return 'Trợ lý AI đang phản hồi lại. Bạn thử bấm gửi lại hoặc chọn câu hỏi gợi ý bên dưới nhé.';
};
