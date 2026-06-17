import {
  Text,
  type StyleProp,
  type TextProps,
  type TextStyle,
  useWindowDimensions,
} from 'react-native';

import { getResponsiveTypeScale, scaleTextStyle } from '@/theme/responsive';
import { theme, type ThemeColor } from '@/theme/theme';

type TextVariant =
  | 'display'
  | 'headline'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption';

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  headline: {
    fontFamily: theme.fonts.serifBold,
    fontSize: 22,
    lineHeight: 30,
  },
  title: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: theme.fonts.sansRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyStrong: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: theme.fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  caption: {
    fontFamily: theme.fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
  },
};

type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: ThemeColor;
  style?: StyleProp<TextStyle>;
};

export function AppText({
  variant = 'body',
  tone = 'text',
  style,
  selectable = true,
  ...props
}: AppTextProps) {
  const { width } = useWindowDimensions();
  const responsiveVariantStyle = scaleTextStyle(
    variantStyles[variant],
    getResponsiveTypeScale(width),
  );

  return (
    <Text
      selectable={selectable}
      style={[
        responsiveVariantStyle,
        {
          color: theme.colors[tone],
        },
        style,
      ]}
      {...props}
    />
  );
}
