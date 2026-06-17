# Mock Database Layer

Lop nay mo phong du lieu he thong theo kieu gan backend that de frontend khong phai phu thuoc truc tiep vao du lieu hard-code trong tung man hinh.

## Cau truc

- `database.ts`
  - Chua `tableDefinitions` de mo ta cac bang du lieu.
  - Chua `mockDatabaseSeed` la bo seed goc, khong thay doi.
  - Chua `mockDatabase` la snapshot runtime duoc clone tu seed.
- `types.ts`
  - Kieu du lieu cho tung bang.
- `selectors.ts`
  - Chuyen du lieu bang sang dung shape ma UI hien tai dang dung.

## Hanh vi reset du lieu

- Moi thay doi demo chi nen tac dong vao state cuc bo cua man hinh hoac `mockDatabase` runtime.
- `mockDatabaseSeed` luon giu nguyen lam moc ban dau.
- Khi reload app, JS runtime nap lai tu dau nen du lieu demo se tro ve trang thai seed ban dau.
- Neu sau nay can reset bang code, co san `resetMockDatabase()`.

## Luong dung hien tai

- `src/services/library/library.mock.ts`
- `src/services/library/librarian/mock.ts`

Hai file tren chi con la adapter mong lay du lieu tu `selectors.ts`.

## Khi noi backend that

De giu nguyen UI va giam pham vi sua code, uu tien thay o cac diem sau:

1. Thay `mockDatabase` bang du lieu tra ve tu API hoac local cache.
2. Hoac thay logic trong `selectors.ts` de doc tu repository/service that.
3. Giu nguyen shape output cua cac selector de khong can sua cac man hinh.

Neu can nang cap them:

- Tach `selectors.ts` thanh `queries.ts` va `mappers.ts`.
- Thay seed tinh bang fetch async + caching layer.
