import React, { useState, useRef } from 'react';
import { Settings, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import ItemCard from './ItemCard';
import { getContrastTextColor } from '../utils/colorUtils';
import { processMultipleImageFiles } from '../utils/imageUtils';

export default function TierRow({
  tier,
  items,
  isFirst,
  isLast,
  isActive,
  onSetActive,
  onMoveUp,
  onMoveDown,
  onOpenSettings,
  onDropItem,
  onClearTier,
  onDeleteTier,
  onItemClick,
  onEditLabel,
  onAddCustomItemsToTier,
  onOpenAdjust,
  rowHeight = 95, // Height of the ranking row
  cardSize = 'md',
  fitMode = 'contain'
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(tier.label);
  const fileInputRef = useRef(null);

  const textColor = getContrastTextColor(tier.color);
  const labelBoxWidth = Math.max(100, Math.round(rowHeight * 1.05));
  const minRowHeight = rowHeight + 8;

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

    // Case 1: Dropping image files from computer / desktop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      try {
        const newItems = await processMultipleImageFiles(e.dataTransfer.files);
        if (newItems.length > 0) {
          onAddCustomItemsToTier(tier.id, newItems);
        }
      } catch (err) {
        console.error('Lỗi khi tải file vào bậc:', err);
      }
      return;
    }

    // Case 2: Dropping existing items (from pool or another tier)
    let itemId = null;
    let sourceTierId = 'pool';

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

    if (itemId) {
      onDropItem(itemId, tier.id, sourceTierId);
    }
  };

  // Handle drop on a specific item to reorder
  const handleDropOnItem = (draggedItemId, targetTierId, targetIndex) => {
    onDropItem(draggedItemId, tier.id, window.__draggedItem?.sourceTierId || 'pool', targetIndex);
  };

  const handleLabelSubmit = () => {
    setIsEditingLabel(false);
    if (labelValue.trim() && labelValue !== tier.label) {
      onEditLabel(tier.id, labelValue.trim());
    } else {
      setLabelValue(tier.label);
    }
  };

  // Handle choosing files from computer directly for this tier
  const handleFilesChosen = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const newItems = await processMultipleImageFiles(e.target.files);
      if (newItems.length > 0) {
        onAddCustomItemsToTier(tier.id, newItems);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
    }
    e.target.value = '';
  };

  return (
    <div
      onClick={() => onSetActive && onSetActive(tier.id)}
      className={`tier-row flex flex-row items-stretch border-b border-black/80 bg-[#14151a] transition-colors ${
        isDragOver ? 'ring-2 ring-inset ring-amber-400/90 bg-[#1e2330]' : ''
      } ${isActive ? 'ring-1 ring-inset ring-indigo-500/50' : ''}`}
      style={{ minHeight: `${minRowHeight}px` }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for choosing files directly into this tier */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilesChosen}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Tier Label Box (Left side colored header matching user screenshot) */}
      <div
        className="tier-label-box relative flex items-center justify-center p-2 select-none flex-shrink-0 cursor-pointer group"
        style={{
          backgroundColor: tier.color,
          color: textColor,
          width: `${labelBoxWidth}px`,
          minWidth: `${labelBoxWidth}px`,
          minHeight: `${minRowHeight}px`
        }}
        onClick={(e) => {
          e.stopPropagation();
          setIsEditingLabel(true);
        }}
        title="Bấm để sửa tên bậc (Click to edit label)"
      >
        {isEditingLabel ? (
          <input
            type="text"
            value={labelValue}
            autoFocus
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelSubmit();
              if (e.key === 'Escape') {
                setIsEditingLabel(false);
                setLabelValue(tier.label);
              }
            }}
            className="w-full text-center font-bold text-lg sm:text-2xl bg-black/20 rounded border border-black/40 outline-none text-current px-1"
          />
        ) : (
          <span className="font-black text-xl sm:text-3xl tracking-tight text-center break-words px-1 drop-shadow-sm">
            {tier.label}
          </span>
        )}
      </div>

      {/* Drop Zone: Multiple Ranked items with full flex-wrap so images never get cut off */}
      <div 
        className="tier-dropzone flex-1 flex flex-wrap content-start items-center gap-1.5 p-1 sm:p-1 bg-[#121318]"
        style={{ minHeight: `${minRowHeight}px` }}
      >
        {items.map((item, index) => (
          <ItemCard
            key={item.id}
            item={item}
            index={index}
            sourceTierId={tier.id}
            rowHeight={rowHeight}
            autoWidth={true}
            size={cardSize}
            fitMode={fitMode}
            onClick={onItemClick}
            onDropOnItem={handleDropOnItem}
            onOpenAdjust={onOpenAdjust}
          />
        ))}
      </div>

      {/* Row Action Controls (Gear Settings, Move Up/Down, Upload) */}
      <div className="tier-row-controls flex flex-col justify-center items-center gap-1 p-1 bg-[#1a1c23] border-l border-zinc-800/80 flex-shrink-0 w-10 sm:w-11">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSettings(tier);
          }}
          className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition"
          title="Tùy chỉnh bậc này (đổi màu, tên, thêm hàng...)"
        >
          <Settings size={15} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition"
          title="Chọn ảnh từ máy tính để thêm vào bậc này"
        >
          <Upload size={14} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp(tier.id);
          }}
          disabled={isFirst}
          className={`p-1 rounded transition ${
            isFirst
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Di chuyển lên trên"
        >
          <ChevronUp size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown(tier.id);
          }}
          disabled={isLast}
          className={`p-1 rounded transition ${
            isLast
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Di chuyển xuống dưới"
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
}
