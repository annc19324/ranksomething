import React, { useState } from 'react';
import { 
  Download, 
  RotateCcw, 
  Plus, 
  Flame, 
  Layers, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PRESET_TIER_SCHEMES } from '../constants';

export default function Navbar({
  title,
  onTitleChange,
  onOpenExport,
  onAddNewTier,
  onResetAll,
  onSelectPresetScheme,
  onOpenHelp
}) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0e1017]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-yellow-400 text-zinc-950 font-black text-lg shadow-md shadow-amber-500/20">
            <Flame size={20} className="fill-zinc-950 text-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                TIERMAKER VN
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded">
                RAPPER
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Tạo và chia sẻ bảng xếp hạng theo phong cách riêng
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Schemes Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/60 transition"
              title="Đổi bộ mẫu bậc xếp hạng"
            >
              <Layers size={14} className="text-amber-400" />
              <span className="hidden md:inline">Bộ mẫu bậc</span>
            </button>

            {showPresets && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#181a22] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 text-xs animate-fade-in"
                onClick={() => setShowPresets(false)}
              >
                <div className="px-2 py-1.5 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                  Chọn kiểu thang xếp hạng
                </div>
                {Object.entries(PRESET_TIER_SCHEMES).map(([key, scheme]) => (
                  <button
                    key={key}
                    onClick={() => onSelectPresetScheme(scheme)}
                    className="w-full text-left px-2.5 py-2 hover:bg-zinc-800 rounded-lg text-zinc-200 hover:text-white transition flex flex-col gap-0.5"
                  >
                    <span className="font-semibold">{scheme.name}</span>
                    <span className="text-[10px] text-zinc-400">
                      {scheme.tiers.map((t) => t.label).join(' • ')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Tier Button */}
          <button
            type="button"
            onClick={onAddNewTier}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/60 transition"
            title="Thêm một bậc mới vào cuối bảng"
          >
            <Plus size={14} className="text-emerald-400" />
            <span className="hidden sm:inline">Thêm hàng</span>
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Bạn có muốn đặt lại toàn bộ bảng về trạng thái ban đầu?')) {
                onResetAll();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg border border-zinc-700/60 transition"
            title="Khôi phục mặc định"
          >
            <RotateCcw size={14} />
            <span className="hidden lg:inline">Đặt lại</span>
          </button>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            title="Hướng dẫn sử dụng"
          >
            <HelpCircle size={16} />
          </button>

          {/* Prominent Download Button */}
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 rounded-lg shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
            title="Xuất bảng xếp hạng thành ảnh PNG chất lượng cao"
          >
            <Download size={16} className="text-zinc-950" />
            <span>TẢI ẢNH VỀ MÁY</span>
          </button>
        </div>
      </div>
    </header>
  );
}
