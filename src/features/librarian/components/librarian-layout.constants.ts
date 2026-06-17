export const LIBRARIAN_TAB_BAR_MAX_WIDTH = 640;
export const LIBRARIAN_TAB_BAR_OUTER_HORIZONTAL = 14;
export const LIBRARIAN_TAB_BAR_OUTER_TOP = 8;
export const LIBRARIAN_TAB_BAR_INNER_PADDING = 6;
export const LIBRARIAN_TAB_BAR_MIN_HEIGHT = 54;
export const LIBRARIAN_TAB_BAR_OUTER_HORIZONTAL_COMPACT = 10;
export const LIBRARIAN_TAB_BAR_INNER_PADDING_COMPACT = 4;
export const LIBRARIAN_TAB_BAR_MIN_HEIGHT_COMPACT = 50;

export function getLibrarianTabBarClearance(bottomInset: number) {
  return 126 + Math.max(bottomInset, 12);
}
