import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@screens/HomeScreen';
import ProductDetailScreen from '@screens/ProductDetailScreen';
import ScannerScreen from '@screens/ScannerScreen';
import AIChatScreen from '@screens/AIChatScreen';
import { COLORS } from '@constants/theme';

import CheckoutScreen from '@screens/CheckoutScreen';
import OrderDetailScreen from '@screens/OrderDetailScreen';

export type HomeStackParamList = {
  Home: { scannedCode?: string } | undefined;
  ProductDetail: { productId: string };
  Scanner: undefined;
  AIChat: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

interface HomeStackNavigatorProps {
  onLogout?: () => void;
}

export default function HomeStackNavigator({ onLogout }: HomeStackNavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackTitle: 'Quay lại',
      }}
    >
      <Stack.Screen
        name="Home"
        options={{ headerShown: false }}
      >
        {() => <HomeScreen onLogout={onLogout} />}
      </Stack.Screen>

      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />

      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ title: 'Quét mã vạch' }}
      />

      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{ title: 'Tư vấn AI' }}
      />

      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Thanh toán' }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Chi tiết đơn hàng' }}
      />
    </Stack.Navigator>
  );
}
