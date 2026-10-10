import React, { useState } from 'react';
import { X, ArrowUp, ArrowDown, Plus, Trash2, Eraser, Palette, Check } from 'lucide-react';
import { COLOR_PALETTE } from '../constants';
import { getContrastTextColor } from '../utils/colorUtils';

export default function TierSettingsModal({
  tier,
  isOpen,
  onClose,
  onUpdateTier,
  onAddTierAbove,
  onAddTierBelow,
  onClearTier,
  onDeleteTier,
  itemCount = 0
}) {
  if (!isOpen || !tier) return null;

  const [label, setLabel] = useState(tier.label);
  const [color, setColor] = useState(tier.color);

  const handleSave = () => {
    onUpdateTier(tier.id, {
      label: label.trim() || tier.label,
      color: color
    });
    onClose();
  };

  const textColor = getContrastTextColor(color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#181a20] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-[#14151a]">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-amber-400" />
            <h3 className="font-semibold text-base">Cài đặt bậc xếp hạng</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Preview box */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Xem trước hiển thị:</label>
            <div 
              className="h-16 rounded-lg flex items-center justify-center font-bold text-2xl shadow-inner border border-black/20"
              style={{ backgroundColor: color, color: textColor }}
            >
              {label || 'TÊN BẬC'}
            </div>
          </div>

          {/* Edit Label */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tên bậc (Label):</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="VD: S, A, GOD TIER, Huyền Thoại..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-white font-medium focus:outline-none focus:border-amber-400 transition"
              maxLength={25}
            />
          </div>

          {/* Color Picker Palette */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-zinc-400">Chọn màu sắc:</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-mono">{color}</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  title="Chọn màu tự do"
                />
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2 p-2 bg-zinc-900/80 rounded-lg border border-zinc-800">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-md transition transform hover:scale-110 flex items-center justify-center ${
                    color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color.toLowerCase() === c.toLowerCase() && (
                    <Check size={14} className={getContrastTextColor(c) === '#111827' ? 'text-black' : 'text-white'} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Row Position Actions */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Thêm bậc mới:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onAddTierAbove(tier.id);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-zinc-200"
              >
                <ArrowUp size={14} /> Thêm hàng ở trên
              </button>
              <button
                type="button"
                onClick={() => {
                  onAddTierBelow(tier.id);
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition text-zinc-200"
              >
                <ArrowDown size={14} /> Thêm hàng ở dưới
              </button>
            </div>
          </div>

          {/* Destructive Actions */}
          <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Đưa ${itemCount} ảnh trong bậc này trở lại kho ảnh?`)) {
                  onClearTier(tier.id);
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-300 rounded-lg transition"
            >
              <Eraser size={14} /> Đưa tất cả ảnh trong hàng này về kho
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Bạn có chắc muốn xóa bậc "${tier.label}"? Các ảnh sẽ được chuyển về kho.`)) {
                  onDeleteTier(tier.id);
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg transition"
            >
              <Trash2 size={14} /> Xóa bậc này
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-zinc-800 bg-[#14151a]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
