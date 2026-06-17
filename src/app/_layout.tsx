import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
} from '@expo-google-fonts/libre-caslon-text';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { theme } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const appTheme = {
  dark: false,
  colors: {
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.danger,
  },
  fonts: {
    regular: {
      fontFamily: theme.fonts.sansRegular,
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: theme.fonts.sansMedium,
      fontWeight: '500' as const,
    },
    bold: {
      fontFamily: theme.fonts.sansBold,
      fontWeight: '700' as const,
    },
    heavy: {
      fontFamily: theme.fonts.serifBold,
      fontWeight: '700' as const,
    },
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    LibreCaslonText_400Regular,
    LibreCaslonText_700Bold,
  });

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={appTheme}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background },
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(librarian)" />
          <Stack.Screen name="(student)" />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
