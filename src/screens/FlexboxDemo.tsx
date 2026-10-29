// src/screens/demos/FlexboxDemo.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlexAlignType,
} from "react-native";

// Component Box màu gradient/hiệu ứng đẹp mắt
interface BoxProps {
    label: string | number;
    color?: string;
    subLabel?: string;
}

const Box: React.FC<BoxProps> = ({ label, color = "#6366F1", subLabel }) => (
    <View style={[styles.box, { backgroundColor: color }]}>
        <Text style={styles.boxText}>{label}</Text>
        {subLabel && <Text style={styles.boxSubText}>{subLabel}</Text>}
    </View>
);

const JUSTIFY_OPTIONS = [
    "flex-start",
    "center",
    "flex-end",
    "space-between",
    "space-around",
    "space-evenly",
] as const;

const ALIGN_OPTIONS: FlexAlignType[] = [
    "flex-start",
    "center",
    "flex-end",
    "stretch",
];

const DIRECTION_OPTIONS = ["column", "row"] as const;

export default function FlexboxDemo() {
    // State tương tác trực tiếp
    const [direction, setDirection] =
        useState<(typeof DIRECTION_OPTIONS)[number]>("row");
    const [justify, setJustify] =
        useState<(typeof JUSTIFY_OPTIONS)[number]>("flex-start");
    const [align, setAlign] = useState<FlexAlignType>("stretch");

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Title */}
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>CHƯƠNG 4 • PHẦN 4.1</Text>
                </View>
                <Text style={styles.title}>Flexbox Mastery ⚡</Text>
                <Text style={styles.subtitle}>
                    Trực quan hóa không gian và các thuộc tính căn chỉnh bố cục
                </Text>
            </View>

            {/* ===== PHẦN 1: TƯƠNG TÁC LIVE DIRECTION (MAIN AXIS & CROSS AXIS) ===== */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>1. Hướng trục: flexDirection</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{direction}</Text>
                    </View>
                </View>
                <Text style={styles.cardDesc}>
                    {direction === "column"
                        ? "Trục Chính (Main): ↓ Dọc | Trục Phụ (Cross): ↔ Ngang"
                        : "Trục Chính (Main): → Ngang | Trục Phụ (Cross): ↕ Dọc"}
                </Text>

                {/* Nút chọn Direction */}
                <View style={styles.buttonGroup}>
                    {DIRECTION_OPTIONS.map((opt) => {
                        const active = direction === opt;
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.pillBtn, active && styles.pillBtnActive]}
                                onPress={() => setDirection(opt)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.pillBtnText,
                                        active && styles.pillBtnTextActive,
                                    ]}
                                >
                                    {opt === "column"
                                        ? "column (Mặc định RN)"
                                        : "row (Hàng ngang)"}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Khung demo */}
                <View
                    style={[
                        styles.demoCanvas,
                        {
                            flexDirection: direction,
                            minHeight: direction === "column" ? 170 : 100,
                        },
                    ]}
                >
                    <Box label="1" color="#6366F1" />
                    <Box label="2" color="#8B5CF6" />
                    <Box label="3" color="#EC4899" />
                </View>
            </View>

            {/* ===== PHẦN 2: TƯƠNG TÁC JUSTIFY CONTENT (TRỤC CHÍNH) ===== */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>2. Căn Trục Chính: justifyContent</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{justify}</Text>
                    </View>
                </View>
                <Text style={styles.cardDesc}>
                    Căn chỉnh tất cả phần tử con bám theo Trục Chính (Main Axis)
                </Text>

                {/* Các nút chọn justifyContent */}
                <View style={styles.buttonGroup}>
                    {JUSTIFY_OPTIONS.map((opt) => {
                        const active = justify === opt;
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.pillBtn, active && styles.pillBtnActive]}
                                onPress={() => setJustify(opt)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.pillBtnText,
                                        active && styles.pillBtnTextActive,
                                    ]}
                                >
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Khung demo */}
                <View
                    style={[
                        styles.demoCanvas,
                        { flexDirection: "row", justifyContent: justify },
                    ]}
                >
                    <Box label="1" color="#3B82F6" />
                    <Box label="2" color="#06B6D4" />
                    <Box label="3" color="#10B981" />
                </View>
            </View>

            {/* ===== PHẦN 3: TƯƠNG TÁC ALIGN ITEMS (TRỤC PHỤ) ===== */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>3. Căn Trục Phụ: alignItems</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{align}</Text>
                    </View>
                </View>
                <Text style={styles.cardDesc}>
                    Căn chỉnh các phần tử theo Trục Phụ (Cross Axis - vuông góc)
                </Text>

                {/* Các nút chọn alignItems */}
                <View style={styles.buttonGroup}>
                    {ALIGN_OPTIONS.map((opt) => {
                        const active = align === opt;
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.pillBtn, active && styles.pillBtnActive]}
                                onPress={() => setAlign(opt)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.pillBtnText,
                                        active && styles.pillBtnTextActive,
                                    ]}
                                >
                                    {opt} {opt === "stretch" && "(Mặc định)"}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Khung demo cao hơn để thấy rõ trục phụ */}
                <View
                    style={[
                        styles.demoCanvas,
                        styles.tallCanvas,
                        { flexDirection: "row", alignItems: align },
                    ]}
                >
                    <Box label="1" color="#F59E0B" />
                    <Box label="2" color="#EF4444" />
                    <Box label="3" color="#8B5CF6" />
                </View>
            </View>

            {/* ===== PHẦN 4: PHÂN CHIA TỈ LỆ KHÔNG GIAN (flex: 1 vs flex: 2) ===== */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>4. Phân chia tỉ lệ: flex: 1 vs flex: 2</Text>
                </View>
                <Text style={styles.cardDesc}>
                    Tổng = 1 + 2 = 3 phần không gian (1/3 và 2/3 bề rộng)
                </Text>

                <View style={[styles.demoCanvas, { flexDirection: "row", height: 60 }]}>
                    <View
                        style={[
                            styles.flexRatioBox,
                            { flex: 1, backgroundColor: "#6366F1" },
                        ]}
                    >
                        <Text style={styles.flexBoxText}>flex: 1 (33%)</Text>
                    </View>
                    <View
                        style={[
                            styles.flexRatioBox,
                            { flex: 2, backgroundColor: "#10B981" },
                        ]}
                    >
                        <Text style={styles.flexBoxText}>flex: 2 (67%)</Text>
                    </View>
                </View>
            </View>

            {/* ===== PHẦN 5: BỐ CỤC THỰC TẾ PRODUCT CARD (SHOPAI ITEM) ===== */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>5. Thực chiến: Product Card (Row Layout)</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ShopAI Card</Text>
                    </View>
                </View>
                <Text style={styles.cardDesc}>
                    Mẫu bố cục kinh điển: Cột trái ảnh cố định (flex: 0), Cột phải thông tin co giãn (flex: 1)
                </Text>

                {/* Product Card Row */}
                <View style={styles.productCard}>
                    {/* Cột trái: Ảnh (Kích thước cố định 80x80) */}
                    <View style={styles.productImageMock}>
                        <Text style={styles.imageMockEmoji}>🎧</Text>
                    </View>

                    {/* Cột phải: Thông tin tự giãn lấp đầy không gian còn lại */}
                    <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>
                            Tai nghe Bluetooth Không Dây Pro ANC Chống Ồn Chủ Động
                        </Text>
                        <Text style={styles.productRating}>⭐⭐⭐⭐⭐ (128 đánh giá)</Text>

                        {/* Hàng giá + Nút bấm: space-between */}
                        <View style={styles.priceRow}>
                            <Text style={styles.productPrice}>1.490.000 ₫</Text>
                            <TouchableOpacity style={styles.buyBtn} activeOpacity={0.8}>
                                <Text style={styles.buyBtnText}>Mua ngay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* ===== PHẦN 6: ĐỊNH VỊ TUYỆT ĐỐI (position: 'absolute') ===== */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>6. Định vị: position: 'absolute'</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>FAB & Badges</Text>
                    </View>
                </View>
                <Text style={styles.cardDesc}>
                    Thoát khỏi dòng chảy Flexbox để ghim vị trí tuyệt đối (Huy hiệu thông báo, Nút nổi FAB)
                </Text>

                {/* Khung mô phỏng mini container có position relative */}
                <View style={styles.absoluteDemoContainer}>
                    {/* Badge đè lên Icon */}
                    <View style={styles.iconWithBadgeWrapper}>
                        <Text style={styles.cartIconText}>🛒</Text>
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationBadgeText}>3</Text>
                        </View>
                    </View>

                    <Text style={styles.absoluteNote}>
                        Badge đỏ được ghim ở góc phải trên:
                        {"\n"}
                        <Text style={styles.codeSnippetText}>
                            {"{ position: 'absolute', top: -4, right: -8 }"}
                        </Text>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A", // Dark Slate hiện đại, sang trọng
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 48,
    },
    header: {
        marginBottom: 20,
        alignItems: "flex-start",
    },
    badge: {
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(99, 102, 241, 0.4)",
        marginBottom: 8,
    },
    badgeText: {
        color: "#818CF8",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#F8FAFC",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: "#94A3B8",
        lineHeight: 18,
    },
    card: {
        backgroundColor: "#1E293B",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#334155",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#F1F5F9",
        flex: 1,
    },
    statusBadge: {
        backgroundColor: "#312E81",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#6366F1",
    },
    statusText: {
        color: "#A5B4FC",
        fontSize: 11,
        fontWeight: "600",
        fontFamily: "monospace",
    },
    cardDesc: {
        fontSize: 12,
        color: "#94A3B8",
        marginBottom: 12,
        lineHeight: 16,
    },
    buttonGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 12,
    },
    pillBtn: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 8,
        backgroundColor: "#334155",
        borderWidth: 1,
        borderColor: "#475569",
    },
    pillBtnActive: {
        backgroundColor: "#6366F1",
        borderColor: "#818CF8",
        shadowColor: "#6366F1",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 2,
    },
    pillBtnText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#CBD5E1",
    },
    pillBtnTextActive: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    demoCanvas: {
        backgroundColor: "#0B1120",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#1E293B",
        borderStyle: "dashed",
        padding: 10,
        gap: 8,
    },
    tallCanvas: {
        minHeight: 130,
    },
    box: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 2,
    },
    boxText: {
        color: "#FFFFFF",
        fontWeight: "800",
        fontSize: 15,
    },
    boxSubText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 10,
    },
    flexRatioBox: {
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    flexBoxText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },
    // Product Card styles
    productCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0B1120",
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    productImageMock: {
        width: 76,
        height: 76,
        borderRadius: 10,
        backgroundColor: "#1E293B",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#475569",
    },
    imageMockEmoji: {
        fontSize: 34,
    },
    productInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    productName: {
        fontSize: 13,
        fontWeight: "700",
        color: "#F8FAFC",
        marginBottom: 4,
        lineHeight: 18,
    },
    productRating: {
        fontSize: 10,
        color: "#94A3B8",
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productPrice: {
        fontSize: 14,
        fontWeight: "800",
        color: "#10B981",
    },
    buyBtn: {
        backgroundColor: "#6366F1",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 6,
    },
    buyBtnText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
    // Absolute Positioning styles
    absoluteDemoContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0B1120",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#334155",
        gap: 16,
    },
    iconWithBadgeWrapper: {
        position: "relative",
        width: 52,
        height: 52,
        backgroundColor: "#1E293B",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#475569",
    },
    cartIconText: {
        fontSize: 26,
    },
    notificationBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#EF4444",
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: "#0B1120",
    },
    notificationBadgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
    },
    absoluteNote: {
        flex: 1,
        fontSize: 12,
        color: "#CBD5E1",
        lineHeight: 18,
    },
    codeSnippetText: {
        fontFamily: "monospace",
        color: "#818CF8",
        fontSize: 11,
    },
});