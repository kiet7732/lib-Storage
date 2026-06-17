import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { theme } from '@/theme/theme';

export type IconName =
  | 'home'
  | 'dashboard'
  | 'books'
  | 'library'
  | 'user'
  | 'search'
  | 'camera'
  | 'bell'
  | 'arrow-left'
  | 'arrow-right'
  | 'clock'
  | 'warning'
  | 'check-circle'
  | 'money'
  | 'info'
  | 'logout'
  | 'trophy'
  | 'bookmark'
  | 'history'
  | 'calendar'
  | 'flash'
  | 'close'
  | 'more'
  | 'task'
  | 'return'
  | 'inventory'
  | 'report'
  | 'tune'
  | 'barcode'
  | 'add';

type AppIconProps = {
  name: IconName;
  color?: ColorValue;
  size?: number;
  strokeWidth?: number;
};

export function AppIcon({
  name,
  color = theme.colors.text,
  size = 24,
  strokeWidth = 2,
}: AppIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <>
          <Path
            d="M3 10.5 12 3l9 7.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5.5 9.8V20h13V9.8"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'dashboard' && (
        <>
          <Rect x="4" y="4" width="6.5" height="6.5" rx="1.4" stroke={color} strokeWidth={strokeWidth} />
          <Rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" stroke={color} strokeWidth={strokeWidth} />
          <Rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" stroke={color} strokeWidth={strokeWidth} />
          <Rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" stroke={color} strokeWidth={strokeWidth} />
        </>
      )}
      {name === 'books' && (
        <>
          <Path
            d="M4 5.5C4 4.67 4.67 4 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5V5.5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Path
            d="M20 5.5C20 4.67 19.33 4 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5V5.5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'library' && (
        <>
          <Rect
            x="4"
            y="4"
            width="7"
            height="16"
            rx="1.5"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Rect
            x="13"
            y="4"
            width="7"
            height="16"
            rx="1.5"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            x1="8"
            y1="8"
            x2="8"
            y2="16"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx="12" cy="8" r="3.2" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M5.5 19c1.6-3.2 3.9-4.8 6.5-4.8S16.9 15.8 18.5 19"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx="10.5" cy="10.5" r="5.5" stroke={color} strokeWidth={strokeWidth} />
          <Line
            x1="15.2"
            y1="15.2"
            x2="20"
            y2="20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'camera' && (
        <>
          <Rect
            x="3.5"
            y="6.5"
            width="17"
            height="12"
            rx="2.5"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle cx="12" cy="12.5" r="3.5" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M7 6.5 8.5 4.5h7L17 6.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path
            d="M7 16.5V11a5 5 0 1 1 10 0v5.5l1.5 1.5H5.5L7 16.5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Path
            d="M10 19a2 2 0 0 0 4 0"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'arrow-left' && (
        <Path
          d="M15 5 8 12l7 7"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === 'arrow-right' && (
        <Path
          d="m9 5 7 7-7 7"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="M12 8v4.5l3 1.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'warning' && (
        <>
          <Path
            d="M12 4 21 20H3L12 4Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Line
            x1="12"
            y1="9"
            x2="12"
            y2="13.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Circle cx="12" cy="17" r="1" fill={color} />
        </>
      )}
      {name === 'check-circle' && (
        <>
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="m8.5 12.2 2.1 2.1L15.8 9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'money' && (
        <>
          <Rect
            x="3.5"
            y="6.5"
            width="17"
            height="11"
            rx="2"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth={strokeWidth} />
          <Line
            x1="6.5"
            y1="9"
            x2="6.5"
            y2="9"
            stroke={color}
            strokeWidth={strokeWidth + 1}
            strokeLinecap="round"
          />
          <Line
            x1="17.5"
            y1="15"
            x2="17.5"
            y2="15"
            stroke={color}
            strokeWidth={strokeWidth + 1}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'info' && (
        <>
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} />
          <Line
            x1="12"
            y1="10.5"
            x2="12"
            y2="15.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Circle cx="12" cy="7.5" r="1" fill={color} />
        </>
      )}
      {name === 'logout' && (
        <>
          <Path
            d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d="m13 8 5 4-5 4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line
            x1="9"
            y1="12"
            x2="18"
            y2="12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'trophy' && (
        <>
          <Path
            d="M8 5h8v2a4 4 0 0 1-8 0V5Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
          <Path
            d="M8 7H6a2 2 0 0 0 2 3M16 7h2a2 2 0 0 1-2 3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d="M12 11v4M9 20h6M10 15h4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'bookmark' && (
        <Path
          d="M7 4h10v16l-5-3-5 3V4Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      )}
      {name === 'history' && (
        <>
          <Path
            d="M4 12a8 8 0 1 0 2.4-5.7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Path
            d="M4 4v4h4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M12 8v4l2.5 1.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect
            x="4"
            y="5.5"
            width="16"
            height="14"
            rx="2"
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            x1="8"
            y1="3.5"
            x2="8"
            y2="7.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Line
            x1="16"
            y1="3.5"
            x2="16"
            y2="7.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Line
            x1="4"
            y1="10"
            x2="20"
            y2="10"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </>
      )}
      {name === 'task' && (
        <>
          <Rect x="4.5" y="4.5" width="15" height="15" rx="2.5" stroke={color} strokeWidth={strokeWidth} />
          <Path
            d="m8 10 1.8 1.8L12.8 9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line x1="14.5" y1="10.5" x2="17.2" y2="10.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="8" y1="15.5" x2="17.2" y2="15.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
      {name === 'return' && (
        <>
          <Path
            d="M9 7H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="m15 5 4 4-4 4"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line x1="9" y1="9" x2="19" y2="9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
      {name === 'inventory' && (
        <>
          <Rect x="5" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth={strokeWidth} />
          <Path d="M5 9.5h14M9 5v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
      {name === 'report' && (
        <>
          <Path d="M6 19.5V8.5M12 19.5V4.5M18 19.5V12.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="4.5" y1="19.5" x2="19.5" y2="19.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
      {name === 'tune' && (
        <>
          <Line x1="5" y1="7" x2="19" y2="7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="9" cy="7" r="1.7" fill={theme.colors.background} stroke={color} strokeWidth={strokeWidth} />
          <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="15" cy="12" r="1.7" fill={theme.colors.background} stroke={color} strokeWidth={strokeWidth} />
          <Line x1="5" y1="17" x2="19" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Circle cx="11" cy="17" r="1.7" fill={theme.colors.background} stroke={color} strokeWidth={strokeWidth} />
        </>
      )}
      {name === 'barcode' && (
        <>
          <Line x1="5" y1="6" x2="5" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          <Line x1="8" y1="6" x2="8" y2="18" stroke={color} strokeWidth={strokeWidth - 0.4} strokeLinecap="round" />
          <Line x1="10.5" y1="6" x2="10.5" y2="18" stroke={color} strokeWidth={strokeWidth + 0.3} strokeLinecap="round" />
          <Line x1="14" y1="6" x2="14" y2="18" stroke={color} strokeWidth={strokeWidth - 0.5} strokeLinecap="round" />
          <Line x1="16.5" y1="6" x2="16.5" y2="18" stroke={color} strokeWidth={strokeWidth + 0.2} strokeLinecap="round" />
          <Line x1="19" y1="6" x2="19" y2="18" stroke={color} strokeWidth={strokeWidth - 0.2} strokeLinecap="round" />
        </>
      )}
      {name === 'add' && (
        <>
          <Line
            x1="12"
            y1="5.5"
            x2="12"
            y2="18.5"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Line
            x1="5.5"
            y1="12"
            x2="18.5"
            y2="12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'flash' && (
        <Path
          d="M13 2 6 13h5l-1 9 8-12h-5l0-8Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === 'close' && (
        <>
          <Line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <Line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </>
      )}
      {name === 'more' && (
        <>
          <Circle cx="12" cy="5" r="1.2" fill={color} />
          <Circle cx="12" cy="12" r="1.2" fill={color} />
          <Circle cx="12" cy="19" r="1.2" fill={color} />
        </>
      )}
    </Svg>
  );
}
