import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { AI_GREETING, AI_SUGGESTIONS } from '@constants/aiPrompt';
import { askShopAI, toFriendlyError, type ChatTurn } from '@services/geminiService';
import { MOCK_PRODUCTS, Product } from '@data/mockProducts';
import { useCartStore } from '@store/useCartStore';
import { triggerHaptic } from '@constants/student';

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  status?: 'sent' | 'error';
  suggestedProducts?: Product[];
};

export default function AIChatScreen() {
  const navigation = useNavigation<any>();
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'greeting', text: AI_GREETING, isBot: true, status: 'sent' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<FlatList<Message>>(null);
  const lastQuestionRef = useRef<string>('');

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  /** Tự động phát hiện sản phẩm trong kho khi AI tư vấn */
  const detectMentionedProducts = (text: string): Product[] => {
    const lower = text.toLowerCase();
    const matched: Product[] = [];

    for (const p of MOCK_PRODUCTS) {
      const pNameLower = p.name.toLowerCase();
      // Khớp theo tên chuẩn
      if (lower.includes('iphone 15 pro') && p.id === 'prod_iphone_15_pro') {
        matched.push(p);
      } else if (lower.includes('iphone 15') && !lower.includes('pro') && p.id === 'prod_iphone_15') {
        matched.push(p);
      } else if (lower.includes('iphone 16') && p.id === 'prod_4') {
        matched.push(p);
      } else if ((lower.includes('asus tuf') || lower.includes('tuf gaming')) && p.id === 'prod_laptop_asus_tuf') {
        matched.push(p);
      } else if ((lower.includes('macbook pro') || lower.includes('m3 pro')) && p.id === 'prod_laptop_macbook_pro') {
        matched.push(p);
      } else if (lower.includes('macbook air') && p.id === 'prod_5') {
        matched.push(p);
      } else if (lower.includes('s24 ultra') && p.id === 'prod_16') {
        matched.push(p);
      } else if ((lower.includes('airpods') || lower.includes('airpods pro')) && p.id === 'prod_1') {
        matched.push(p);
      } else if (lower.includes('wh-1000xm5') && p.id === 'prod_2') {
        matched.push(p);
      } else if (lower.includes('mx master') && p.id === 'prod_pc_1') {
        matched.push(p);
      } else if (lower.includes('tigernu') && p.id === 'prod_balo_1') {
        matched.push(p);
      } else if ((lower.includes('balo iuh') || lower.includes('campus')) && p.id === 'prod_balo_4') {
        matched.push(p);
      } else if (lower.includes(pNameLower)) {
        matched.push(p);
      }
    }

    // Loại bỏ sản phẩm trùng lặp và lấy tối đa 2 sản phẩm nổi bật nhất
    const unique = Array.from(new Set(matched.map((m) => m.id)))
      .map((id) => matched.find((m) => m.id === id)!)
      .slice(0, 2);

    return unique;
  };

  /** Xử lý Thêm vào giỏ hàng trực tiếp từ AI */
  const handleAddToCart = (product: Product) => {
    triggerHaptic(30);
    Vibration.vibrate(50);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });

    Alert.alert(
      '🛍️ Đã thêm vào giỏ hàng',
      `Đã thêm "${product.name}" vào giỏ hàng thành công! Bạn có thể xem giỏ hàng ngay.`,
      [
        { text: 'Tiếp tục chat', style: 'cancel' },
        {
          text: 'Xem giỏ hàng',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
        },
      ],
    );
  };

  /** Xử lý Đặt mua ngay trực tiếp từ AI */
  const handleBuyNow = (product: Product) => {
    triggerHaptic(40);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  /** Dựng lịch sử hội thoại theo đúng định dạng Gemini yêu cầu. */
  const buildHistory = useCallback((list: Message[]): ChatTurn[] => {
    return list
      .filter((m) => m.id !== 'greeting' && m.status !== 'error')
      .map((m) => ({
        role: m.isBot ? ('model' as const) : ('user' as const),
        parts: [{ text: m.text }],
      }));
  }, []);

  /** Lõi gửi tin */
  const send = useCallback(
    async (question: string, historySource: Message[]) => {
      lastQuestionRef.current = question;
      setIsTyping(true);
      scrollToEnd();

      try {
        const reply = await askShopAI(question, buildHistory(historySource));
        const matchedProducts = detectMentionedProducts(reply + ' ' + question);

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            text: reply,
            isBot: true,
            status: 'sent',
            suggestedProducts: matchedProducts,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { id: `err-${Date.now()}`, text: toFriendlyError(error), isBot: true, status: 'error' },
        ]);
      } finally {
        setIsTyping(false);
        scrollToEnd();
      }
    },
    [buildHistory],
  );

  const handleSend = useCallback(
    (overrideText?: string) => {
      const text = (overrideText ?? inputText).trim();
      if (!text || isTyping) return;

      const userMsg: Message = { id: `user-${Date.now()}`, text, isBot: false, status: 'sent' };
      const next = [...messages, userMsg];

      setMessages(next);
      setInputText('');
      send(text, next);
    },
    [inputText, isTyping, messages, send],
  );

  /** Nút Thử lại: xoá bong bóng lỗi cuối cùng rồi gửi lại đúng câu hỏi cũ. */
  const handleRetry = useCallback(() => {
    if (isTyping || !lastQuestionRef.current) return;
    const cleaned = messages.filter((m) => m.status !== 'error');
    setMessages(cleaned);
    send(lastQuestionRef.current, cleaned);
  }, [isTyping, messages, send]);

  const renderItem = ({ item }: { item: Message }) => (
    <View style={styles.messageRow}>
      <View
        style={[
          styles.bubble,
          item.isBot ? styles.botBubble : styles.userBubble,
          item.status === 'error' && styles.errorBubble,
        ]}
      >
        <Text
          selectable
          style={{ color: item.isBot ? '#1F2937' : '#FFFFFF', fontSize: 15, lineHeight: 22 }}
        >
          {item.text}
        </Text>
      </View>

      {/* HIỂN THỊ THẺ SẢN PHẨM TRỰC TIẾP DƯỚI TIN NHẮN TƯ VẤN CỦA AI */}
      {item.isBot && item.suggestedProducts && item.suggestedProducts.length > 0 && (
        <View style={styles.suggestedProductsContainer}>
          <Text style={styles.suggestedHeader}>📦 Sản phẩm có sẵn tại ShopAI KTX:</Text>
          {item.suggestedProducts.map((prod) => (
            <View key={prod.id} style={styles.productCardAI}>
              <Image source={{ uri: prod.image }} style={styles.productImageAI} resizeMode="cover" />
              <View style={styles.productInfoAI}>
                <Text style={styles.productNameAI} numberOfLines={2}>
                  {prod.name}
                </Text>
                <Text style={styles.productPriceAI}>
                  {prod.price.toLocaleString('vi-VN')} đ
                </Text>
                <View style={styles.actionBtnRowAI}>
                  <TouchableOpacity
                    style={styles.addToCartBtnAI}
                    onPress={() => handleAddToCart(prod)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.addToCartTextAI}>🛒 Thêm giỏ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buyNowBtnAI}
                    onPress={() => handleBuyNow(prod)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buyNowTextAI}>⚡ Mua ngay</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {item.status === 'error' && (
        <Pressable onPress={handleRetry} style={styles.retryBtn}>
          <Text style={styles.retryText}>🔄 Thử lại</Text>
        </Pressable>
      )}
    </View>
  );

  /** Trạng thái rỗng: gợi ý sẵn câu hỏi để user biết hỏi gì */
  const renderSuggestions = () => (
    <View style={styles.suggestBox}>
      <Text style={styles.suggestTitle}>Gợi ý câu hỏi:</Text>
      <View style={styles.chipRow}>
        {AI_SUGGESTIONS.map((s) => (
          <Pressable key={s} style={styles.chip} onPress={() => handleSend(s)} disabled={isTyping}>
            <Text style={styles.chipText}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const canSend = inputText.trim().length > 0 && !isTyping;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* HEADER CHAT TÍCH HỢP NÚT GIỎ HÀNG */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Nhân viên AI (Gemini)</Text>
            <Text style={styles.headerSub}>
              {isTyping ? 'Đang trả lời...' : '🟢 Đang hoạt động • Sẵn sàng hỗ trợ đặt hàng'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerCartBtn}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
            activeOpacity={0.7}
          >
            <Text style={styles.headerCartIcon}>🛒</Text>
            {totalCartQuantity > 0 && (
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>
                  {totalCartQuantity > 99 ? '99+' : totalCartQuantity}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: SIZES.padding, flexGrow: 1 }}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <>
              {messages.length <= 1 && renderSuggestions()}
              {isTyping && (
                <View style={[styles.bubble, styles.botBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text style={styles.typingText}> Trợ lý đang soạn câu trả lời...</Text>
                </View>
              )}
            </>
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Hỏi giá iPhone 15, laptop, tai nghe..."
            placeholderTextColor="#9CA3AF"
            maxLength={500}
            editable={!isTyping}
            multiline
            onSubmitEditing={() => handleSend()}
          />
          <ShopButton
            title="Gửi"
            onPress={() => handleSend()}
            isLoading={isTyping}
            disabled={!canSend}
            style={{ width: 75, height: 42, opacity: canSend ? 1 : 0.5 }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  backBtnText: {
    fontSize: 22,
    color: '#1E293B',
    fontWeight: '700',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#16A34A', marginTop: 2, fontWeight: '600' },
  headerCartBtn: {
    padding: 6,
    position: 'relative',
  },
  headerCartIcon: {
    fontSize: 22,
  },
  headerCartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  messageRow: {
    marginBottom: 12,
  },
  bubble: { padding: 14, borderRadius: 18, maxWidth: '85%' },
  botBubble: { backgroundColor: '#F1F5F9', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: '#4F46E5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  errorBubble: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: COLORS.error },
  typingBubble: { flexDirection: 'row', alignItems: 'center' },
  typingText: { color: '#64748B', fontSize: 13, marginLeft: 6 },

  suggestedProductsContainer: {
    marginTop: 8,
    marginLeft: 4,
    maxWidth: '92%',
  },
  suggestedHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  productCardAI: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageAI: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  productInfoAI: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  productNameAI: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  productPriceAI: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 2,
  },
  actionBtnRowAI: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  addToCartBtnAI: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  addToCartTextAI: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '700',
  },
  buyNowBtnAI: {
    backgroundColor: '#4F46E5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buyNowTextAI: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  retryBtn: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 4 },
  retryText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },

  suggestBox: { marginTop: 8, marginBottom: 16 },
  suggestTitle: { fontSize: 13, color: '#64748B', marginBottom: 8, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
  },
  chipText: { color: '#4F46E5', fontSize: 13, fontWeight: '600' },

  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 10,
    color: '#1E293B',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
