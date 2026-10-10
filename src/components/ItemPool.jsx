import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Search, 
  RotateCcw, 
  Trash2, 
  Sparkles, 
  Plus, 
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Grid,
  Eye,
  RefreshCw
} from 'lucide-react';
import ItemCard from './ItemCard';
import { generateId } from '../utils/colorUtils';
import { processMultipleImageFiles } from '../utils/imageUtils';

export default function ItemPool({
  items,
  totalItemsCount,
  onDropToPool,
  onItemClick,
  onAddCustomItems,
  onResetToDefault,
  onClearAllToPool,
  onDeleteCustomItem,
  onReloadDefaultPhotos,
  onOpenAdjust
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded so all images are visible!
  const [fitMode, setFitMode] = useState('cover'); // 'cover' or 'contain'
  const [cardSize, setCardSize] = useState('md'); // 'sm', 'md', 'lg'
  const fileInputRef = useRef(null);

  // Filter items by search query
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle Drag & Drop to Pool (from tiers or files from desktop)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check if files were dropped from computer / desktop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        const newItems = await processMultipleImageFiles(e.dataTransfer.files);
        if (newItems.length > 0) {
          onAddCustomItems(newItems);
        }
      } catch (err) {
        console.error('Lỗi khi tải file vào kho:', err);
      }
      return;
    }

    // 2. Check if an existing item was dragged back from a tier
    let itemId = null;
    let sourceTierId = null;

    if (window.__draggedItem) {
      itemId = window.__draggedItem.itemId;
      sourceTierId = window.__draggedItem.sourceTierId;
    } else {
      try {
        const raw = e.dataTransfer.getData('text/plain');
        if (raw) {
          const parsed = JSON.parse(raw);
          itemId = parsed.itemId;
          sourceTierId = parsed.sourceTierId;
        }
      } catch (err) {
        itemId = e.dataTransfer.getData('text/x-item-id');
      }
    }

    if (itemId && sourceTierId && sourceTierId !== 'pool') {
      onDropToPool(itemId, sourceTierId);
    }
  };

  // Process file uploads from file picker
  const handleFileInputChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const newItems = await processMultipleImageFiles(e.target.files);
      if (newItems.length > 0) {
        onAddCustomItems(newItems);
      }
    } catch (err) {
      console.error('Lỗi khi xử lý ảnh:', err);
    }
    e.target.value = '';
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    const newItem = {
      id: generateId('url'),
      name: imageName.trim() || 'Ảnh URL',
      image: imageUrl.trim(),
      subtitle: 'Đường dẫn URL',
      isCustom: true
    };

    onAddCustomItems([newItem]);
    setImageUrl('');
    setImageName('');
    setShowUrlInput(false);
  };

  return (
    <div
      className={`item-pool-container mt-6 bg-[#161820] border rounded-xl overflow-hidden shadow-xl transition-all ${
        isDragOver ? 'border-amber-400 ring-2 ring-amber-400/40 bg-[#1c1f2b]' : 'border-zinc-800'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Pool Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#111318] border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ImageIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Kho ảnh chưa xếp hạng
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 font-bold border border-amber-400/30">
                {items.length} / {totalItemsCount} ảnh
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Toàn bộ ảnh hiển thị đầy đủ bên dưới. Kéo thả vào hàng hoặc click để chọn nhanh bậc!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition transform active:scale-95"
            title="Chọn nhiều file ảnh từ máy tính để thêm vào kho"
          >
            <Upload size={14} /> Chọn ảnh từ máy
          </button>

          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
          >
            <LinkIcon size={14} /> Thêm URL
          </button>

          {onReloadDefaultPhotos && (
            <button
              type="button"
              onClick={onReloadDefaultPhotos}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-lg transition border border-amber-500/20"
              title="Cập nhật lại 28 ảnh rapper mới nhất vào kho"
            >
              <RefreshCw size={13} /> Nạp lại 28 ảnh gốc
            </button>
          )}

          <button
            type="button"
            onClick={onClearAllToPool}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
            title="Đưa tất cả ảnh đã xếp hạng trở lại kho này"
          >
            <RotateCcw size={14} /> Đưa hết về kho
          </button>
        </div>
      </div>

      {/* URL Input Form */}
      {showUrlInput && (
        <form onSubmit={handleUrlSubmit} className="p-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap gap-2 items-center">
          <input
            type="url"
            placeholder="Dán đường dẫn ảnh (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
          />
          <input
            type="text"
            placeholder="Tên rapper / hình ảnh"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            className="w-44 px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold bg-amber-400 text-zinc-950 rounded-lg hover:bg-amber-300"
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-2 py-1.5 text-xs text-zinc-400 hover:text-white"
          >
            Đóng
          </button>
        </form>
      )}

      {/* Search and Display Options Bar */}
      <div className="px-4 py-2.5 bg-[#14151c] border-b border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhanh rapper theo tên..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-900/90 border border-zinc-700/60 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Display Controls (Expand/Collapse, Fit Mode, Size) */}
        <div className="flex items-center gap-2 text-xs">
          {/* Fit Mode Toggle */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setFitMode('cover')}
              className={`px-2 py-1 rounded-md transition ${
                fitMode === 'cover' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Cắt ảnh vừa ô card"
            >
              Đầy ô
            </button>
            <button
              type="button"
              onClick={() => setFitMode('contain')}
              className={`px-2 py-1 rounded-md transition ${
                fitMode === 'contain' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
              title="Xem trọn vẹn toàn bộ ảnh (không bị cắt mép)"
            >
              Trọn ảnh
            </button>
          </div>

          {/* Size Toggle */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px] hidden sm:flex">
            <button
              type="button"
              onClick={() => setCardSize('sm')}
              className={`px-2 py-1 rounded-md transition ${
                cardSize === 'sm' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nhỏ
            </button>
            <button
              type="button"
              onClick={() => setCardSize('md')}
              className={`px-2 py-1 rounded-md transition ${
                cardSize === 'md' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vừa
            </button>
            <button
              type="button"
              onClick={() => setCardSize('lg')}
              className={`px-2 py-1 rounded-md transition ${
                cardSize === 'lg' ? 'bg-zinc-800 text-amber-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Lớn
            </button>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700/60 transition text-[11px]"
            title={isExpanded ? 'Thu gọn chiều cao' : 'Mở rộng hiển thị toàn bộ ảnh'}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isExpanded ? 'Thu gọn' : 'Xem toàn bộ'}</span>
          </button>
        </div>
      </div>

      {/* Pool Items Grid - FULLY EXPANDED BY DEFAULT so NO IMAGES ARE HIDDEN! */}
      <div 
        className={`p-4 flex flex-wrap gap-2.5 content-start items-center bg-[#0d0e13] transition-all duration-200 ${
          isExpanded ? 'min-h-[220px]' : 'max-h-[340px] overflow-y-auto'
        }`}
      >
        {items.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center text-center text-zinc-500 gap-2">
            <Sparkles size={32} className="text-amber-400 mb-1 opacity-80" />
            <p className="text-sm font-bold text-zinc-200">Tất cả ảnh đã được xếp hạng vào các bậc!</p>
            <p className="text-xs text-zinc-400 max-w-sm">
              Bạn có thể tải thêm ảnh mới từ máy tính, dán ảnh (Ctrl+V), hoặc bấm "Đưa hết về kho" để xếp lại từ đầu.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
            >
              <Upload size={14} /> Thêm ảnh từ máy tính
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="w-full py-10 text-center text-zinc-500 text-xs">
            Không tìm thấy rapper nào khớp với "{searchQuery}"
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const poolItemHeight = cardSize === 'sm' ? 70 : cardSize === 'lg' ? 115 : 90;
            return (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                sourceTierId="pool"
                rowHeight={poolItemHeight}
                autoWidth={true}
                size={cardSize}
                fitMode={fitMode}
                onClick={onItemClick}
                onDelete={item.isCustom ? onDeleteCustomItem : undefined}
                onOpenAdjust={onOpenAdjust}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
