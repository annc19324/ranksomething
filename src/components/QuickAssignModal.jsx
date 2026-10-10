import React from 'react';
import { X, Archive, Sliders, ArrowRight } from 'lucide-react';
import { getContrastTextColor } from '../utils/colorUtils';

export default function QuickAssignModal({
  item,
  currentTierId,
  tiers,
  isOpen,
  onClose,
  onAssignToTier,
  onOpenAdjust
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-sm bg-[#181a20] border border-zinc-800 rounded-2xl shadow-2xl p-5 text-zinc-100 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-12 h-12 rounded-lg object-cover border border-zinc-700 shadow"
            />
            <div>
              <h3 className="font-bold text-base text-white">{item.name || 'Ảnh đã chọn'}</h3>
              <p className="text-xs text-zinc-400">{item.subtitle || 'Chọn bậc hoặc chỉnh ảnh'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Adjust Position & Zoom button */}
        {onOpenAdjust && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdjust(item);
            }}
            className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-semibold shadow transition transform active:scale-98"
          >
            <span className="flex items-center gap-2">
              <Sliders size={15} /> Chỉnh trên / dưới / trái / phải / size ảnh
            </span>
            <ArrowRight size={14} className="text-zinc-500" />
          </button>
        )}

        <div>
          <p className="text-xs font-medium text-zinc-400 mb-2">Chọn bậc để chuyển tới:</p>
          <div className="grid grid-cols-2 gap-2">
            {tiers.map((t) => {
              const isCurrent = currentTierId === t.id;
              const textColor = getContrastTextColor(t.color);
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onAssignToTier(item.id, t.id);
                    onClose();
                  }}
                  className={`flex items-center justify-center h-12 rounded-lg font-bold text-base transition-transform transform active:scale-95 shadow ${
                    isCurrent ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-[#181a20]' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: t.color,
                    color: textColor
                  }}
                >
                  {t.label}
                  {isCurrent && <span className="text-xs ml-1 font-normal opacity-80">(hiện tại)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {currentTierId !== 'pool' && (
          <button
            onClick={() => {
              onAssignToTier(item.id, 'pool');
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition"
          >
            <Archive size={15} /> Đưa trở lại Kho ảnh chưa xếp hạng
          </button>
        )}
      </div>
    </div>
  );
}
