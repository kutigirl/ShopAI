import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ShopButton from '@components/ShopButton';
import ShopInput from '@components/ui/ShopInput';
import { COLORS, SIZES } from '@constants/theme';

import axiosClient from '@api/axiosClient';

// Chú ý: Ở bài này ta truyền giả lập onLogin qua Props để hiểu Auth Flow.
// Ở chương sau ta sẽ đổi sang dùng Zustand để tránh Prop Drilling.
const LoginScreen = ({
  onLogin,
  onGoRegister,
}: {
  onLogin: (token: string) => void;
  onGoRegister: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Validate đơn giản: Email phải chứa @, Mật khẩu tối thiểu 6 ký tự
  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.includes('@')) next.email = 'Email không hợp lệ (phải chứa @)';
    if (password.length < 6) next.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerError(null);

    try {
      const response = await axiosClient.post('/api/auth/login', {
        email,
        password,
      });
      onLogin(response.data.accessToken);
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      setServerError(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg ?? 'Đăng nhập thất bại, vui lòng kiểm tra lại',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopAI</Text>
      <Text style={styles.subtitle}>Vui lòng đăng nhập để tiếp tục</Text>

      <ShopInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <ShopInput
        label="Mật khẩu"
        placeholder="Ít nhất 6 ký tự"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
      />

      {serverError && <Text style={styles.errorText}>⚠️ {serverError}</Text>}

      <ShopButton
        title="Đăng nhập ngay"
        onPress={handleLogin}
        loading={loading}
        style={styles.loginBtn}
      />

      {/* Liên kết sang màn Đăng ký trong cùng AuthStack (Bước 2.5) */}
      <Pressable onPress={onGoRegister} style={styles.registerLink}>
        <Text style={styles.registerLinkText}>
          Chưa có tài khoản?{' '}
          <Text style={styles.registerLinkBold}>Đăng ký</Text>
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: SIZES.body1,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginBtn: {
    marginTop: 8,
  },
  errorText: {
    marginBottom: 12,
    color: COLORS.danger,
    fontSize: SIZES.body2,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  registerLinkBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
