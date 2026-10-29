import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStackNavigator from '@navigation/HomeStackNavigator';
import CartScreen from '@screens/CartScreen';
import OrdersScreen from '@screens/OrdersScreen';
import ProfileScreen from '@screens/ProfileScreen';
import { useCartStore } from '@store/useCartStore';
import { COLORS } from '@constants/theme';
import { triggerHaptic } from '@constants/student';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
  cartBadgeCount?: number;
}

const MainTabNavigator = ({ onLogout }: Props) => {
  const dynamicCartCount = useCartStore((state) => state.totalQuantity());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        listeners={{
          tabPress: () => triggerHaptic(20),
        }}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-variant-outline" color={color} size={size} />
          ),
        }}
      >
        {() => <HomeStackNavigator onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        listeners={{
          tabPress: () => triggerHaptic(20),
        }}
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart-outline" color={color} size={size} />
          ),
          tabBarBadge: dynamicCartCount > 0 ? dynamicCartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            fontSize: 10,
            fontWeight: 'bold',
          },
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        listeners={{
          tabPress: () => triggerHaptic(20),
        }}
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        listeners={{
          tabPress: () => triggerHaptic(20),
        }}
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-outline" color={color} size={size} />
          ),
        }}
      >
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
