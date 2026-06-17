import type { ReactNode } from 'react';
import { Link, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { selectionHaptic } from '@/utils/haptics';

import { theme } from '@/theme/theme';

type IconButtonProps = {
  children: ReactNode;
  label: string;
  href?: Href;
  onPress?: () => void;
  variant?: 'soft' | 'ghost';
};

export function IconButton({
  children,
  href,
  label,
  onPress,
  variant = 'soft',
}: IconButtonProps) {
  const content = (
    <Pressable
      accessibilityLabel={label}
      onPress={async () => {
        await selectionHaptic();
        onPress?.();
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: theme.radius.pill,
            borderCurve: 'continuous',
            backgroundColor:
              variant === 'soft' ? 'rgba(255,255,255,0.16)' : 'transparent',
            opacity: pressed ? 0.7 : 1,
          }}
        >
          {children}
        </View>
      )}
    </Pressable>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {content}
      </Link>
    );
  }

  return content;
}
