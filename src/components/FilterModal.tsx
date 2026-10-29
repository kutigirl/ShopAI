// src/components/FilterModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import { triggerHaptic } from '@constants/student';

export interface FilterOptions {
  priceRange: 'all' | 'under1m5' | 'over1m5';
  sortBy: 'default' | 'priceAsc' | 'priceDesc';
}

const DEFAULT_OPTIONS: FilterOptions = {
  priceRange: 'all',
  sortBy: 'default',
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (options: FilterOptions) => void;
  onApplyFilters?: (options: FilterOptions) => void;
  initialOptions?: FilterOptions;
  currentFilters?: FilterOptions;
}

export default function FilterModal({
  visible,
  onClose,
  onApply,
  onApplyFilters,
  initialOptions,
  currentFilters,
}: FilterModalProps) {
  const activeInitial = currentFilters || initialOptions || DEFAULT_OPTIONS;
  const [options, setOptions] = useState<FilterOptions>(activeInitial);

  // Đồng bộ khi props thay đổi
  useEffect(() => {
    const next = currentFilters || initialOptions || DEFAULT_OPTIONS;
    setOptions(next);
  }, [currentFilters, initialOptions, visible]);

  const handleReset = () => {
    triggerHaptic(25);
    setOptions(DEFAULT_OPTIONS);
    if (onApplyFilters) onApplyFilters(DEFAULT_OPTIONS);
    if (onApply) onApply(DEFAULT_OPTIONS);
    onClose();
  };

  const handleApply = () => {
    triggerHaptic(30);
    const safeOptions = options || DEFAULT_OPTIONS;
    if (onApplyFilters) onApplyFilters(safeOptions);
    if (onApply) onApply(safeOptions);
    onClose();
  };

  const currentPriceRange = options?.priceRange || 'all';
  const currentSortBy = options?.sortBy || 'default';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Thanh gạt trên đỉnh sheet */}
              <View style={styles.dragHandle} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Bộ Lọc Sản Phẩm ⚙️</Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.resetText}>Đặt lại</Text>
                </TouchableOpacity>
              </View>

              {/* Khoảng giá */}
              <Text style={styles.sectionTitle}>Khoảng giá</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under1m5', label: 'Dưới 1.500.000 ₫' },
                  { id: 'over1m5', label: 'Từ 1.500.000 ₫ trở lên' },
                ].map((item) => {
                  const active = currentPriceRange === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => {
                        triggerHaptic(20);
                        setOptions({
                          ...(options || DEFAULT_OPTIONS),
                          priceRange: item.id as FilterOptions['priceRange'],
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sắp xếp */}
              <Text style={styles.sectionTitle}>Sắp xếp theo giá</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'default', label: 'Mặc định' },
                  { id: 'priceAsc', label: 'Giá tăng dần (Thấp → Cao)' },
                  { id: 'priceDesc', label: 'Giá giảm dần (Cao → Thấp)' },
                ].map((item) => {
                  const active = currentSortBy === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => {
                        triggerHaptic(20);
                        setOptions({
                          ...(options || DEFAULT_OPTIONS),
                          sortBy: item.id as FilterOptions['sortBy'],
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <ShopButton
                  title="Áp dụng bộ lọc"
                  onPress={handleApply}
                  style={styles.applyBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SIZES.padding,
    paddingTop: 12,
    paddingBottom: 32,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: SIZES.body1,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 16,
  },
  applyBtn: {
    height: 46,
    borderRadius: 12,
  },
});
