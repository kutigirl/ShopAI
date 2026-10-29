import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@contexts/ThemeContext';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import MainTabNavigator from '@navigation/MainTabNavigator';
import CheckoutScreen from '@screens/CheckoutScreen';
import OrderDetailScreen from '@screens/OrderDetailScreen';
import ScannerScreen from '@screens/ScannerScreen';
import BiometricGateScreen from '@screens/BiometricGateScreen';
import { useAuthStore } from '@store/useAuthStore';
import { useAppLock } from '@hooks/useAppLock';
import OfflineBanner from '@components/OfflineBanner';
import { COLORS } from '@constants/theme';

const queryClient = new QueryClient();

// Stack dành riêng cho luồng Auth (Login & Register)
const AuthStack = createNativeStackNavigator();

// Stack chính sau khi đăng nhập (MainTabs + Modal Checkout + OrderDetail)
const RootStack = createNativeStackNavigator();

// Cấu hình Deep Linking: shopai://product/:productId hoặc shopai://order/:orderId
const linking: LinkingOptions<any> = {
  prefixes: ['shopai://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              ProductDetail: 'product/:productId',
              Scanner: 'scanner',
              AIChat: 'aichat',
            },
          },
          Cart: 'cart',
          Orders: 'orders',
        },
      },
      Checkout: 'checkout',
      OrderDetail: 'order/:orderId',
    },
  },
};

export default function App(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const checkLocalToken = useAuthStore((state) => state.checkLocalToken);

  // Cổng sinh trắc học: false = đang khoá, true = đã mở
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // Móc vào ổ cứng SecureStore (Keystore) ngay khi App vừa khởi chạy
    checkLocalToken();
  }, [checkLocalToken]);

  // Khi user đăng xuất (token về null), phải KHOÁ LẠI cổng
  useEffect(() => {
    if (token == null) {
      setIsUnlocked(false);
    }
  }, [token]);

  // Canh gác App Lock — tự động đặt lại isUnlocked = false nếu App ở nền quá lâu
  useAppLock({ isUnlocked, setIsUnlocked });

  // 1. Đang kiểm tra Keystore lúc mở app -> Hiện loading toàn màn hình
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 2. Có token trong máy NHƯNG chưa quét sinh trắc học -> chặn ở cổng
  if (token != null && !isUnlocked) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <BiometricGateScreen onUnlock={() => setIsUnlocked(true)} />
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  // Khi vừa đăng nhập thành công bằng mật khẩu -> mở khóa luôn
  const handleLoginSuccess = async (newToken: string) => {
    setIsUnlocked(true);
    await login(newToken);
  };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <OfflineBanner />
          <NavigationContainer linking={linking}>
            {token == null ? (
              // LUỒNG 1: CHƯA ĐĂNG NHẬP — AuthStack: Login + Register (Ch.5 & Ch.9)
              <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                <AuthStack.Screen name="Login">
                  {({ navigation }) => (
                    <LoginScreen
                      onLogin={handleLoginSuccess}
                      onGoRegister={() => navigation.navigate('Register')}
                    />
                  )}
                </AuthStack.Screen>
                <AuthStack.Screen name="Register">
                  {({ navigation }) => (
                    <RegisterScreen
                      onRegistered={handleLoginSuccess}
                      onGoLogin={() => navigation.navigate('Login')}
                    />
                  )}
                </AuthStack.Screen>
              </AuthStack.Navigator>
            ) : (
              // LUỒNG 2: ĐÃ ĐĂNG NHẬP — RootStack (MainTabs + Modal Checkout + OrderDetail)
              <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="MainTabs">
                  {() => <MainTabNavigator onLogout={logout} />}
                </RootStack.Screen>
                <RootStack.Screen
                  name="Checkout"
                  component={CheckoutScreen}
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />
                <RootStack.Screen
                  name="OrderDetail"
                  component={OrderDetailScreen}
                  options={{
                    headerShown: false,
                  }}
                />
                <RootStack.Screen
                  name="Scanner"
                  component={ScannerScreen}
                  options={{
                    headerShown: false,
                  }}
                />
              </RootStack.Navigator>
            )}
          </NavigationContainer>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}