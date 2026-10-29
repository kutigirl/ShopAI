import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';

export type ChatHistoryItem = { role: 'user' | 'model'; text: string };

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey as string);
  }

  async chat(message: string, history: ChatHistoryItem[] = []): Promise<string> {
    const systemInstruction =
      'Bạn là trợ lý tư vấn bán hàng của ShopAI KTX IUH.\n' +
      'YÊU CẦU BẮT BUỘC:\n' +
      '1. TRỌNG TÂM: Trả lời thẳng vào câu hỏi của khách hàng, tuyệt đối không lan man, không viết dài dòng như bài văn.\n' +
      '2. GỢI Ý CỤ THỂ: Đề xuất đúng 1 đến 2 sản phẩm tốt nhất phù hợp nhu cầu.\n' +
      '3. CẤU TRÚC: [Tên sản phẩm] - [Giá bán] - [1 lý do ngắn gọn vì sao nên mua].\n' +
      '4. NGẮN GỌN: Toàn bộ phản hồi chỉ từ 2 đến 3 dòng ngắn, súc tích.';

    let geminiHistory: Content[] = history.slice(-6).map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    while (geminiHistory.length > 0 && geminiHistory[0].role === 'model') {
      geminiHistory.shift();
    }

    // Thử gọi Gemini với timeout 2.5s để không bao giờ làm app bị lag hoặc ngắt kết nối
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        systemInstruction,
      });

      const chatPromise = (async () => {
        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
      })();

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

      const reply = await Promise.race([chatPromise, timeoutPromise]);
      if (reply && reply.trim().length > 0) {
        return reply.trim();
      }
    } catch (err: any) {
      console.warn(`Gemini call error: ${err.message}. Sử dụng bộ tri thức ShopAI tức thì.`);
    }

    // Bộ tri thức ShopAI phản hồi siêu tốc, trọng tâm và chuẩn xác giá
    return this.resolveLocalKnowledge(message);
  }

  private resolveLocalKnowledge(message: string): string {
    const q = message.toLowerCase();

    if (q.includes('iphone 15 pro') || q.includes('ip 15 pro') || q.includes('15 pro')) {
      return (
        '📱 **iPhone 15 Pro 128GB Titanium** - **24.890.000đ**\n' +
        'Thiết kế khung titan cao cấp, chip A17 Pro mạnh mẽ, camera zoom 3x chuyên nghiệp.\n' +
        '👉 Giao tận phòng KTX IUH, hỗ trợ giảm thêm 15.000đ khi thanh toán qua ví IUH Pay.'
      );
    }

    if (q.includes('iphone 15') || q.includes('ip 15') || q.includes('iphone')) {
      return (
        '📱 **iPhone 15 128GB** - **19.290.000đ**\n' +
        'Màn hình Dynamic Island thời thượng, camera chính 48MP sắc nét, cổng sạc Type-C tiện lợi.\n' +
        '👉 Đang có sẵn tại KTX IUH, bảo hành chính hãng VN/A 12 tháng.'
      );
    }

    if (q.includes('macbook') || q.includes('mac')) {
      return (
        '💻 **MacBook Pro 14 inch M3 Pro** - **48.990.000đ**\n' +
        'Màn hình Liquid Retina XDR 120Hz siêu nét, thời lượng pin đến 18 giờ, tối ưu chuyên đồ họa và lập trình.'
      );
    }

    if (q.includes('asus') || q.includes('tuf') || q.includes('gaming') || q.includes('laptop')) {
      return (
        '💻 **Laptop ASUS TUF Gaming F15** - **18.990.000đ**\n' +
        'Intel Core i5 thế hệ mới, card đồ họa RTX 3050, màn hình 144Hz cân mượt học tập và chơi game giải trí.'
      );
    }

    if (q.includes('chuột') || q.includes('mouse') || q.includes('logitech')) {
      return (
        '🖱️ **Chuột không dây Logitech MX Master 3S** - **1.890.000đ**\n' +
        'Con lăn MagSpeed siêu tốc, bấm êm Quiet Clicks, cảm biến 8K DPI mượt mà trên mọi mặt phẳng.'
      );
    }

    if (q.includes('tai nghe') || q.includes('airpod') || q.includes('airpods')) {
      return (
        '🎧 **Tai nghe Apple AirPods Pro 2** - **5.690.000đ**\n' +
        'Chống ồn chủ động ANC gấp 2 lần, chất âm không gian sống động, pin dùng cả ngày cùng hộp sạc Type-C.'
      );
    }

    if (q.includes('sạc') || q.includes('ugreen') || q.includes('củ sạc')) {
      return (
        '⚡ **Củ sạc nhanh 20W Ugreen Type-C** - **250.000đ**\n' +
        'Chuẩn Power Delivery sạc 50% pin chỉ trong 30 phút, kích thước siêu nhỏ gọn, chống quá nhiệt an toàn.'
      );
    }

    if (q.includes('balo') || q.includes('ba lô') || q.includes('cặp')) {
      return (
        '🎒 **Balo Laptop chống nước Tigernu** - **490.000đ**\n' +
        'Vải Oxford kháng nước cao cấp, ngăn đệm chống sốc vừa laptop 15.6 inch, có cổng sạc USB tích hợp.'
      );
    }

    if (q.includes('bình') || q.includes('nước') || q.includes('lock')) {
      return (
        '🥤 **Bình giữ nhiệt Lock&Lock 500ml** - **280.000đ**\n' +
        'Inox 304 an toàn cho sức khỏe, giữ nóng/lạnh liên tục 8 tiếng, lý tưởng mang theo khi lên giảng đường IUH.'
      );
    }

    if (q.includes('bàn phím') || q.includes('keychron') || q.includes('phím')) {
      return (
        '⌨️ **Bàn phím cơ Keychron K2 V2** - **1.650.000đ**\n' +
        'Switch Gateron gõ êm đầm tay, kết nối Bluetooth 3 thiết bị cùng lúc, tương thích cả Mac và Windows.'
      );
    }

    return (
      'Chào bạn! ShopAI có sẵn các sản phẩm hot nhất cho sinh viên IUH:\n' +
      '• **iPhone 15** (19.290.000đ) & **iPhone 15 Pro** (24.890.000đ)\n' +
      '• **Laptop ASUS TUF Gaming** (18.990.000đ) & **MacBook Pro M3 Pro** (48.990.000đ)\n' +
      '• Cùng sạc Ugreen 20W, chuột MX Master 3S, tai nghe AirPods Pro 2 giao tận phòng KTX nhé!'
    );
  }
}
