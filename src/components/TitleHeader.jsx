import React, { useState } from 'react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Palette, 
  Edit3, 
  Settings2, 
  Check, 
  Type 
} from 'lucide-react';
import { TITLE_COLORS } from '../constants';

export default function TitleHeader({
  titleConfig,
  onChangeTitleConfig
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempText, setTempText] = useState(titleConfig.text);

  const handleTextSubmit = () => {
    setIsEditingText(false);
    if (tempText.trim()) {
      onChangeTitleConfig({ ...titleConfig, text: tempText.trim() });
    } else {
      setTempText(titleConfig.text);
    }
  };

  const handleColorChange = (color) => {
    onChangeTitleConfig({ ...titleConfig, color });
  };

  const handleAlignChange = (align) => {
    onChangeTitleConfig({ ...titleConfig, align });
  };

  const handleSizeChange = (fontSize) => {
    onChangeTitleConfig({ ...titleConfig, fontSize });
  };

  // Alignment class mapping
  const alignClass = titleConfig.align === 'left' 
    ? 'text-left justify-start' 
    : titleConfig.align === 'right' 
      ? 'text-right justify-end' 
      : 'text-center justify-center';

  // Font size class mapping
  const sizeClass = titleConfig.fontSize === 'xl' 
    ? 'text-base sm:text-xl' 
    : titleConfig.fontSize === '3xl' 
      ? 'text-xl sm:text-3xl' 
      : 'text-lg sm:text-2xl';

  return (
    <div className="tier-board-header bg-[#0f1015] px-4 py-3 sm:py-4 border-b border-zinc-800">
      <div className="flex flex-col gap-2">
        {/* Main Title Row */}
        <div className={`flex items-center gap-3 w-full ${alignClass}`}>
          {isEditingText ? (
            <div className="flex items-center gap-2 w-full max-w-xl">
              <input
                type="text"
                value={tempText}
                autoFocus
                onChange={(e) => setTempText(e.target.value)}
                onBlur={handleTextSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTextSubmit();
                  if (e.key === 'Escape') {
                    setIsEditingText(false);
                    setTempText(titleConfig.text);
                  }
                }}
                className={`w-full font-black ${sizeClass} uppercase tracking-wide bg-black/60 px-3 py-1 rounded-lg border border-amber-400 outline-none`}
                style={{ color: titleConfig.color }}
              />
              <button
                type="button"
                onClick={handleTextSubmit}
                className="px-3 py-1 bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg shadow"
              >
                Xong
              </button>
            </div>
          ) : (
            <div className="group relative inline-flex items-center gap-2.5 cursor-pointer select-none">
              <h1
                onClick={() => setIsEditingText(true)}
                className={`font-black uppercase tracking-wide break-words drop-shadow-md ${sizeClass}`}
                style={{ color: titleConfig.color }}
                title="Bấm để đổi nội dung tiêu đề"
              >
                {titleConfig.text}
              </h1>

              {/* Action buttons (Hidden during export) */}
              <div className="tier-row-controls flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsEditingText(true)}
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                  title="Sửa nội dung tiêu đề"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1 rounded transition ${
                    showSettings 
                      ? 'bg-amber-400 text-zinc-950' 
                      : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                  }`}
                  title="Chỉnh màu sắc & căn lề tiêu đề"
                >
                  <Settings2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expanded Title Customizer Bar (Can be toggled) */}
        {showSettings && (
          <div className="tier-row-controls mt-2 p-3 bg-zinc-900/95 border border-zinc-700/80 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-fade-in">
            {/* Color Chooser */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium flex items-center gap-1">
                <Palette size={13} className="text-amber-400" /> Màu chữ:
              </span>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {TITLE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className={`w-5 h-5 rounded-full transition transform hover:scale-110 flex items-center justify-center ${
                      titleConfig.color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    {titleConfig.color.toLowerCase() === c.toLowerCase() && (
                      <Check size={10} className={c === '#ffffff' ? 'text-black' : 'text-white'} />
                    )}
                  </button>
                ))}

                {/* Custom Hex Color Picker */}
                <input
                  type="color"
                  value={titleConfig.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-5 h-5 ml-1 rounded cursor-pointer border-0 bg-transparent"
                  title="Chọn màu khác"
                />
              </div>
            </div>

            {/* Alignment Chooser */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Căn lề:</span>
              <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleAlignChange('left')}
                  className={`p-1.5 rounded-md transition ${
                    titleConfig.align === 'left' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Căn trái"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignChange('center')}
                  className={`p-1.5 rounded-md transition ${
                    titleConfig.align === 'center' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Căn giữa"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignChange('right')}
                  className={`p-1.5 rounded-md transition ${
                    titleConfig.align === 'right' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Căn phải"
                >
                  <AlignRight size={14} />
                </button>
              </div>
            </div>

            {/* Font Size Chooser */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-medium">Cỡ chữ:</span>
              <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSizeChange('xl')}
                  className={`px-2 py-1 rounded-md transition ${
                    titleConfig.fontSize === 'xl' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Nhỏ
                </button>
                <button
                  type="button"
                  onClick={() => handleSizeChange('2xl')}
                  className={`px-2 py-1 rounded-md transition ${
                    titleConfig.fontSize === '2xl' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Vừa
                </button>
                <button
                  type="button"
                  onClick={() => handleSizeChange('3xl')}
                  className={`px-2 py-1 rounded-md transition ${
                    titleConfig.fontSize === '3xl' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Lớn
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
