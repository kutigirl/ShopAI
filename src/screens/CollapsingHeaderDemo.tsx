// src/screens/CollapsingHeaderDemo.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from "react-native-reanimated";
import { FlashList, FlashListProps } from "@shopify/flash-list";
import ProductCard from "@components/ProductCard";
import { MOCK_PRODUCTS, Product } from "@data/mockProducts";
import { COLORS, SIZES } from "@constants/theme";

// FlashList không có sẵn bản "Animated" như FlatList (react-native đã export sẵn Animated.FlatList).
// Phải tự bọc bằng createAnimatedComponent để useAnimatedScrollHandler gắn được vào sự kiện cuộn của nó.
const AnimatedFlashList = Animated.createAnimatedComponent(
    FlashList
) as unknown as React.ComponentType<FlashListProps<Product>>;

const HEADER_MAX_HEIGHT = 180; // Chiều cao Header lúc đầu (chưa cuộn)
const HEADER_MIN_HEIGHT = 64; // Chiều cao Header nhỏ nhất khi đã cuộn đủ xa
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT; // Cuộn 116px là co xong hoàn toàn

export default function CollapsingHeaderDemo() {
    // Shared Value giữ vị trí cuộn hiện tại (tính bằng pixel) — sống trên UI Thread,
    // được cập nhật liên tục MỖI KHUNG HÌNH khi ngón tay đang kéo, không qua JS Thread.
    const scrollY = useSharedValue(0);

    // useAnimatedScrollHandler: phiên bản "Worklet" của onScroll thông thường.
    // Chạy thẳng trên UI Thread ngay khi FlashList bắn sự kiện cuộn — không có độ trễ
    // 1 khung hình như khi xử lý onScroll ở phía JS Thread.
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // useAnimatedStyle: trả về 1 object style được TÍNH LẠI mỗi khi scrollY đổi giá trị.
    const headerAnimatedStyle = useAnimatedStyle(() => {
        // interpolate(giá trị đang chạy, [khoảng đầu vào], [khoảng đầu ra], cách xử lý khi vượt khoảng)
        // Ở đây: scrollY chạy từ 0 -> SCROLL_RANGE thì height chạy NGƯỢC từ 180 -> 64
        const height = interpolate(
            scrollY.value,
            [0, SCROLL_RANGE],
            [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
            Extrapolation.CLAMP, // CLAMP: cuộn quá xa cũng KHÔNG co nhỏ hơn 64 hay phình to hơn 180
        );
        return { height };
    });

    const titleAnimatedStyle = useAnimatedStyle(() => {
        const fontSize = interpolate(
            scrollY.value,
            [0, SCROLL_RANGE],
            [28, 18],
            Extrapolation.CLAMP,
        );
        // Chữ chỉ mờ tới 50% (không biến mất hẳn) và mờ nhanh hơn (dùng 80% quãng cuộn thay vì 100%)
        const opacity = interpolate(
            scrollY.value,
            [0, SCROLL_RANGE * 0.8],
            [1, 0.5],
            Extrapolation.CLAMP,
        );
        return { fontSize, opacity };
    });

    return (
        <View style={styles.container}>
            {/* Header co giãn — chiều cao và cỡ chữ đều "bám" theo scrollY qua interpolate ở trên */}
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <Animated.Text style={[styles.headerTitle, titleAnimatedStyle]}>
                    Khám phá
                </Animated.Text>
            </Animated.View>

            <AnimatedFlashList
                data={MOCK_PRODUCTS}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProductCard product={item} />}
                numColumns={2}
                onScroll={scrollHandler} // Gắn Worklet xử lý cuộn trực tiếp vào danh sách
                scrollEventThrottle={16} // ~60 lần/giây — chuẩn khai báo đi kèm khi bắt sự kiện onScroll
                contentContainerStyle={{ padding: SIZES.padding / 2 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        justifyContent: "flex-end",
        paddingHorizontal: SIZES.padding,
        paddingBottom: 16,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerTitle: {
        fontWeight: "bold",
        color: COLORS.text,
    },
});