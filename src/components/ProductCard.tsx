import React, { memo, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import { Product } from '@data/mockProducts';
import { triggerHaptic } from '@constants/student';

const { width } = Dimensions.get('window');
const GAP = SIZES.padding;
const CARD_WIDTH = (width - GAP * 3) / 2;

interface Props {
  product: Product;
  onPress?: () => void;
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const ProductCard = ({ product, onPress, onBuyNow, onAddToCart }: Props) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  const handleBuyNow = () => {
    triggerHaptic(45);
    if (onBuyNow) {
      onBuyNow(product);
    }
  };

  const handleAdd = () => {
    triggerHaptic(30);
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
          {onAddToCart && (
            <TouchableOpacity
              style={styles.quickAddBtn}
              activeOpacity={0.7}
              onPress={handleAdd}
            >
              <Text style={styles.quickAddText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoContainer}>
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {product.category}
              </Text>
            </View>
          )}

          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>
              ⭐ {product.rating || 5.0}
            </Text>
            <Text style={styles.reviewText}>
              ({product.reviewCount || 0})
            </Text>
          </View>

          <Text style={styles.price}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.buttonWrapper}>
        <ShopButton
          title="Mua ngay ⚡"
          onPress={handleBuyNow}
          style={styles.buyBtn}
          textStyle={{ fontSize: 13, fontWeight: '700' }}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginHorizontal: GAP / 2,
    marginBottom: GAP,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 0.95,
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  quickAddBtn: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  quickAddText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 22,
  },
  infoContainer: {
    padding: 10,
    paddingBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '700',
  },
  name: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    minHeight: 36,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  reviewText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  price: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '800',
    marginTop: 4,
  },
  buttonWrapper: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  buyBtn: {
    height: 36,
    borderRadius: 8,
  },
});

export default memo(ProductCard);
