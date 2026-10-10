export const DEFAULT_TIERS = [
  { id: 'tier-a', label: 'A', color: '#ff7f7f', itemIds: [] },
  { id: 'tier-b', label: 'B', color: '#ffbf7f', itemIds: [] },
  { id: 'tier-c', label: 'C', color: '#ffdf7f', itemIds: [] },
  { id: 'tier-d', label: 'D', color: '#ffff7f', itemIds: [] },
  { id: 'tier-e', label: 'E', color: '#bfff7f', itemIds: [] },
  { id: 'tier-f', label: 'F', color: '#7fff7f', itemIds: [] },
  { id: 'tier-g', label: 'G', color: '#7fffff', itemIds: [] }
];

export const PRESET_TIER_SCHEMES = {
  letters_a_g: {
    name: 'Kiểu A - B - C - D - E - F - G (Như ảnh gốc)',
    tiers: [
      { id: 'tier-a', label: 'A', color: '#ff7f7f' },
      { id: 'tier-b', label: 'B', color: '#ffbf7f' },
      { id: 'tier-c', label: 'C', color: '#ffdf7f' },
      { id: 'tier-d', label: 'D', color: '#ffff7f' },
      { id: 'tier-e', label: 'E', color: '#bfff7f' },
      { id: 'tier-f', label: 'F', color: '#7fff7f' },
      { id: 'tier-g', label: 'G', color: '#7fffff' }
    ]
  },
  gaming_s_f: {
    name: 'Kiểu S - A - B - C - D - E - F (Tiêu chuẩn Gaming)',
    tiers: [
      { id: 'tier-s', label: 'S', color: '#ff7f7f' },
      { id: 'tier-a', label: 'A', color: '#ffbf7f' },
      { id: 'tier-b', label: 'B', color: '#ffdf7f' },
      { id: 'tier-c', label: 'C', color: '#ffff7f' },
      { id: 'tier-d', label: 'D', color: '#bfff7f' },
      { id: 'tier-e', label: 'E', color: '#7fff7f' },
      { id: 'tier-f', label: 'F', color: '#7fffff' }
    ]
  },
  goat_tier: {
    name: 'Kiểu Đỉnh Cao (GOAT / Huyền Thoại / Quá Đỉnh / Khá / Bình Thường)',
    tiers: [
      { id: 'tier-goat', label: 'GOAT', color: '#ff4d4d' },
      { id: 'tier-legend', label: 'Huyền Thoại', color: '#ff944d' },
      { id: 'tier-super', label: 'Đỉnh Cao', color: '#ffda4d' },
      { id: 'tier-good', label: 'Chất Lượng', color: '#88e04d' },
      { id: 'tier-mid', label: 'Bình Thường', color: '#4de0c9' },
      { id: 'tier-flop', label: 'Cần Cố Gắng', color: '#9d7fff' }
    ]
  }
};

export const COLOR_PALETTE = [
  '#ff7f7f', '#ff947f', '#ffbf7f', '#ffdf7f', '#ffff7f',
  '#bfff7f', '#7fff7f', '#7fffff', '#7fbfff', '#7f7fff',
  '#bf7fff', '#ff7fbf', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6',
  '#6366f1', '#a855f7', '#64748b', '#334155'
];

export const TITLE_COLORS = [
  '#fbbf24', // Vàng Amber
  '#f59e0b', // Vàng cam
  '#ffffff', // Trắng
  '#ef4444', // Đỏ
  '#f97316', // Cam
  '#10b981', // Xanh ngọc
  '#06b6d4', // Cyan
  '#3b82f6', // Xanh dương
  '#8b5cf6', // Tím
  '#ec4899', // Hồng
  '#a1a1aa'  // Xám sáng
];

export const DEFAULT_TITLE_CONFIG = {
  text: 'BẢNG XẾP HẠNG RAPPER VIỆT NAM',
  color: '#fbbf24',
  align: 'center', // 'left' | 'center' | 'right'
  fontSize: '2xl'  // 'xl' | '2xl' | '3xl'
};

export const DEFAULT_ROW_HEIGHT = 95;
export const DEFAULT_TIKTOK_ROW_HEIGHT = 160;
export const STORAGE_KEY_TIERS = 'tier_maker_tiers_epu_v2';
export const STORAGE_KEY_ITEMS = 'tier_maker_items_epu_v2';
export const STORAGE_KEY_TITLE_CONFIG = 'tier_maker_title_config_v2';
export const STORAGE_KEY_ROW_HEIGHT = 'tier_maker_row_height_epu_v2';
export const STORAGE_KEY_EXPORT_ASPECT_RATIO = 'tier_maker_export_aspect_ratio_v1';
export const STORAGE_KEY_TIKTOK_ROW_HEIGHT = 'tier_maker_tiktok_row_height_v1';
