import React, { useState } from 'react';
import { X, ArrowRightLeft, Sliders, ImageOff } from 'lucide-react';

export default function ItemCard({
  item,
  sourceTierId,
  index,
  onDragStart,
  onDragEnd,
  onDropOnItem,
  onClick,
  onDelete,
  onOpenAdjust,
  rowHeight = 95,
  autoWidth = true, // Natural width preserving original aspect ratio
  size = 'md',
  fitMode = 'contain'
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Size mapping fallback if autoWidth is false
  const sizeClasses = size === 'sm' 
    ? 'w-16 h-16 sm:w-20 sm:h-20' 
    : size === 'lg'
      ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
      : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28';

  const handleDragStart = (e) => {
    // 1. Global window state for 100% reliable cross-element reading
    window.__draggedItem = {
      itemId: item.id,
      sourceTierId: sourceTierId || 'pool',
      index: index
    };

    // 2. Standard text payload
    const payload = JSON.stringify({
      itemId: item.id,
      sourceTierId: sourceTierId || 'pool',
      index: index
    });
    e.dataTransfer.setData('text/plain', payload);
    e.dataTransfer.setData('text/x-item-id', item.id);
    e.dataTransfer.effectAllowed = 'move';

    if (onDragStart) onDragStart(item, sourceTierId);
  };

  const handleDragEnd = () => {
    window.__draggedItem = null;
    setIsDragOver(false);
    if (onDragEnd) onDragEnd();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Let the parent row or handler know an item was dropped right at this target index
    if (onDropOnItem) {
      let dragData = window.__draggedItem;
      if (!dragData) {
        try {
          dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch (err) {}
      }
      if (dragData && dragData.itemId) {
        onDropOnItem(dragData.itemId, sourceTierId, index);
      }
    }
  };

  // Effective fit mode, zoom, and translation offsets
  const zoom = item.zoom ?? 100;
  const posX = item.posX ?? 0;
  const posY = item.posY ?? 0;
  const hasTransform = (zoom !== 100 || posX !== 0 || posY !== 0);

  // Generate fallback avatar SVG if image fails
  const renderFallback = () => (
    <div 
      className="flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 p-2 text-center"
      style={{ height: `${rowHeight}px`, minWidth: `${Math.round(rowHeight * 0.8)}px` }}
    >
      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs mb-1">
        {item.name ? item.name.substring(0, 2).toUpperCase() : 'VN'}
      </div>
      <span className="text-[10px] text-zinc-300 font-semibold truncate max-w-full px-1">
        {item.name}
      </span>
    </div>
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onClick && onClick(item, sourceTierId)}
      className={`group relative flex-shrink-0 cursor-grab active:cursor-grabbing select-none rounded-md overflow-hidden bg-zinc-950 border shadow-md hover:scale-102 transition-all duration-150 ${
        autoWidth ? '' : sizeClasses
      } ${
        isDragOver 
          ? 'border-amber-400 ring-2 ring-amber-400 scale-105 z-10' 
          : 'border-zinc-700/80 hover:border-amber-400/90 hover:shadow-amber-500/20'
      }`}
      style={
        autoWidth
          ? {
              height: `${rowHeight}px`,
              width: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          : undefined
      }
      title={`${item.name}${item.subtitle ? ` (${item.subtitle})` : ''} - Kéo để đổi chỗ hoặc click để chọn nhanh bậc`}
    >
      {!imgError && item.image ? (
        <img
          src={item.image}
          alt={item.name}
          onError={() => setImgError(true)}
          className="pointer-events-none select-none block max-w-none"
          style={{
            height: `${rowHeight}px`,
            width: autoWidth ? 'auto' : '100%',
            maxWidth: 'none',
            objectFit: autoWidth ? 'contain' : (fitMode === 'contain' ? 'contain' : 'cover'),
            transform: hasTransform ? `scale(${zoom / 100}) translate(${posX}%, ${posY}%)` : undefined,
            transformOrigin: 'center center'
          }}
          loading="lazy"
        />
      ) : (
        renderFallback()
      )}

      {/* Bottom gradient label with artist name (only if item has a valid name and not generic note) */}
      {item.name && !item.name.toLowerCase().includes('clipboard') && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-1 pt-3 text-center pointer-events-none">
          <p className="text-[10px] sm:text-xs font-bold text-white truncate drop-shadow-sm leading-tight px-1">
            {item.name}
          </p>
        </div>
      )}

      {/* Action buttons on hover */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
        {onOpenAdjust && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAdjust(item);
            }}
            className="p-1 rounded-full bg-zinc-800/90 text-amber-300 hover:text-white hover:bg-zinc-700 hover:scale-110 transition-all shadow"
            title="Chỉnh vị trí trên/dưới/trái/phải & zoom ảnh"
          >
            <Sliders size={11} />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 hover:scale-110 transition-all shadow"
            title="Xóa ảnh này"
          >
            <X size={11} />
          </button>
        )}

        <span className="p-1 rounded-full bg-zinc-800/90 text-zinc-300 hover:text-white transition-all shadow" title="Click để chọn bậc">
          <ArrowRightLeft size={10} />
        </span>
      </div>
    </div>
  );
}
