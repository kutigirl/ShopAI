// Local authentication adapter thay thế cho expo-local-authentication trong React Native CLI
export enum AuthenticationType {
  FINGERPRINT = 1,
  FACIAL_RECOGNITION = 2,
  IRIS = 3,
}

export const hasHardwareAsync = async (): Promise<boolean> => {
  return false;
};

export const isEnrolledAsync = async (): Promise<boolean> => {
  return false;
};

export const supportedAuthenticationTypesAsync = async (): Promise<AuthenticationType[]> => {
  return [];
};

export const authenticateAsync = async (_options?: any): Promise<{ success: boolean }> => {
  return { success: true };
};

export default {
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
  authenticateAsync,
};
