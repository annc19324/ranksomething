import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Move, RotateCcw, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { shouldShowItemName } from '../utils/imageUtils';

export default function ImageAdjustModal({
  item,
  isOpen,
  onClose,
  onSaveAdjustments,
  showItemLabels = true
}) {
  if (!isOpen || !item) return null;

  const [zoom, setZoom] = useState(item.zoom ?? 100);
  const [posX, setPosX] = useState(item.posX ?? 0);
  const [posY, setPosY] = useState(item.posY ?? 0);
  const [fitMode, setFitMode] = useState(item.fitMode || 'cover'); // 'cover' or 'contain'

  // Reset to item values when modal opens with new item
  useEffect(() => {
    if (item) {
      setZoom(item.zoom ?? 100);
      setPosX(item.posX ?? 0);
      setPosY(item.posY ?? 0);
      setFitMode(item.fitMode || 'cover');
    }
  }, [item]);

  const handleReset = () => {
    setZoom(100);
    setPosX(0);
    setPosY(0);
    setFitMode('cover');
  };

  const handleSave = () => {
    onSaveAdjustments(item.id, {
      zoom: Number(zoom),
      posX: Number(posX),
      posY: Number(posY),
      fitMode: fitMode
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#161820] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#111217]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Move size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chỉnh vị trí & kích cỡ ảnh</h3>
              <p className="text-xs text-zinc-400 truncate max-w-[240px]">
                {shouldShowItemName(item) ? item.name : 'Ảnh tùy chỉnh'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Box */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs text-zinc-400 mb-2 font-medium">
              Xem trước hiển thị trong ô thẻ:
            </span>
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden bg-black border-2 border-amber-400/80 shadow-xl flex items-center justify-center">
              <img
                src={item.image}
                alt={shouldShowItemName(item) ? item.name : 'Ảnh chỉnh sửa'}
                className={`w-full h-full pointer-events-none select-none transition-transform duration-75 ${
                  fitMode === 'contain' ? 'object-contain' : 'object-cover'
                }`}
                style={{
                  transform: `scale(${zoom / 100}) translate(${posX}%, ${posY}%)`,
                  transformOrigin: 'center center'
                }}
              />

              {/* Crosshair guide lines */}
              <div className="absolute inset-0 pointer-events-none border border-white/10 flex items-center justify-center">
                <div className="w-full h-[1px] bg-white/15"></div>
                <div className="h-full w-[1px] bg-white/15 absolute"></div>
              </div>

              {showItemLabels && shouldShowItemName(item) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1 pt-3 text-center pointer-events-none">
                  <p className="text-xs font-bold text-white truncate drop-shadow">
                    {item.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fit Mode Switcher */}
          <div className="flex items-center justify-between p-2.5 bg-zinc-900/90 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-300 font-medium">Chế độ hiển thị:</span>
            <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFitMode('cover')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  fitMode === 'cover' ? 'bg-amber-400 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Lấp đầy ô (Cover)
              </button>
              <button
                type="button"
                onClick={() => setFitMode('contain')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  fitMode === 'contain' ? 'bg-amber-400 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Trọn vẹn (Contain)
              </button>
            </div>
          </div>

          {/* Zoom / Size Control Slider */}
          <div className="space-y-1.5 p-3 bg-zinc-900/70 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <ZoomIn size={14} className="text-amber-400" /> Kích cỡ / Thu phóng:
              </span>
              <span className="font-mono text-amber-300 font-bold">{zoom}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">50%</span>
              <input
                type="range"
                min="50"
                max="250"
                step="2"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-zinc-500 font-mono">250%</span>
            </div>
          </div>

          {/* Vertical Position (Trên / Dưới) */}
          <div className="space-y-1.5 p-3 bg-zinc-900/70 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <ArrowUp size={14} className="text-emerald-400" /> Trên / Dưới (Trục dọc Y):
              </span>
              <span className="font-mono text-emerald-300 font-bold">{posY > 0 ? `+${posY}%` : `${posY}%`}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPosY(prev => Math.min(prev + 5, 80))}
                className="p-1 px-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                title="Dịch xuống"
              >
                ▼ Dưới
              </button>
              <input
                type="range"
                min="-80"
                max="80"
                step="1"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
                className="flex-1 accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setPosY(prev => Math.max(prev - 5, -80))}
                className="p-1 px-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                title="Dịch lên"
              >
                ▲ Trên
              </button>
            </div>
          </div>

          {/* Horizontal Position (Trái / Phải) */}
          <div className="space-y-1.5 p-3 bg-zinc-900/70 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <ArrowLeft size={14} className="text-cyan-400" /> Trái / Phải (Trục ngang X):
              </span>
              <span className="font-mono text-cyan-300 font-bold">{posX > 0 ? `+${posX}%` : `${posX}%`}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPosX(prev => Math.max(prev - 5, -80))}
                className="p-1 px-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                title="Dịch sang trái"
              >
                ◄ Trái
              </button>
              <input
                type="range"
                min="-80"
                max="80"
                step="1"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
                className="flex-1 accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setPosX(prev => Math.min(prev + 5, 80))}
                className="p-1 px-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded"
                title="Dịch sang phải"
              >
                ► Phải
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-[#111217]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition"
          >
            <RotateCcw size={13} /> Đặt lại giữa
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition transform active:scale-95"
            >
              <Check size={14} /> Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
