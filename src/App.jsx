import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import TitleHeader from './components/TitleHeader';
import TierRow from './components/TierRow';
import ItemPool from './components/ItemPool';
import TierSettingsModal from './components/TierSettingsModal';
import QuickAssignModal from './components/QuickAssignModal';
import ImageAdjustModal from './components/ImageAdjustModal';
import ExportModal from './components/ExportModal';
import HelpModal from './components/HelpModal';
import { DEFAULT_RAPPERS } from './rappersData';
import { 
  DEFAULT_TIERS, 
  COLOR_PALETTE, 
  DEFAULT_TITLE_CONFIG,
  DEFAULT_ROW_HEIGHT,
  STORAGE_KEY_TIERS, 
  STORAGE_KEY_ITEMS, 
  STORAGE_KEY_TITLE_CONFIG,
  STORAGE_KEY_ROW_HEIGHT 
} from './constants';
import { generateId } from './utils/colorUtils';
import { processClipboardEvent } from './utils/imageUtils';
import { Download, Plus, RotateCcw, CheckCircle, Info } from 'lucide-react';

export default function App() {
  // 1. Title Configuration State (text, color, align, fontSize)
  const [titleConfig, setTitleConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TITLE_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TITLE_CONFIG;
  });

  // 2. Items State (all available items by ID)
  const [itemsMap, setItemsMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // CRITICAL FIX: Merge latest DEFAULT_RAPPERS to ensure all real photos
        // are updated even if the user has an existing localStorage cache!
        DEFAULT_RAPPERS.forEach((r) => {
          if (!parsed[r.id] || parsed[r.id].image !== r.image) {
            parsed[r.id] = { ...(parsed[r.id] || {}), ...r };
          }
        });

        // Clean up any items that were previously given a 'clipboard' label
        Object.keys(parsed).forEach((key) => {
          if (parsed[key].name && parsed[key].name.toLowerCase().includes('clipboard')) {
            parsed[key].name = '';
            parsed[key].subtitle = '';
          }
        });
        return parsed;
      }
    } catch (e) {}
    const map = {};
    DEFAULT_RAPPERS.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  });

  // 3. Tiers State (array of { id, label, color, itemIds: [] })
  const [tiers, setTiers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_TIERS;
  });

  // 4. Modals, Active Selections & Toast Notification
  const [activeTierId, setActiveTierId] = useState(null);
  const [activeTierForSettings, setActiveTierForSettings] = useState(null);
  const [quickAssignData, setQuickAssignData] = useState(null); // { item, currentTierId }
  const [adjustingItem, setAdjustingItem] = useState(null); // item being adjusted in ImageAdjustModal
  const [boardCardSize, setBoardCardSize] = useState('md'); // 'sm' | 'md' | 'lg'
  const [boardFitMode, setBoardFitMode] = useState('contain'); // default to 'contain' with auto-width (natural aspect ratio)
  const [rowHeight, setRowHeight] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROW_HEIGHT);
      if (saved) return Number(saved);
    } catch (e) {}
    return DEFAULT_ROW_HEIGHT;
  });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const tierListRef = useRef(null);

  // Save image position/zoom/fitMode adjustments
  const handleSaveAdjustments = (itemId, adjustments) => {
    setItemsMap((prev) => {
      const existing = prev[itemId] || {};
      return {
        ...prev,
        [itemId]: {
          ...existing,
          ...adjustments
        }
      };
    });
    showToast('Đã lưu vị trí và kích cỡ ảnh!');
  };

  // Helper to trigger toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Derive unranked items in pool
  const rankedItemIds = new Set();
  tiers.forEach((t) => {
    (t.itemIds || []).forEach((id) => rankedItemIds.add(id));
  });

  const poolItems = Object.values(itemsMap).filter((item) => !rankedItemIds.has(item.id));
  const totalItemsCount = Object.keys(itemsMap).length;

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIERS, JSON.stringify(tiers));
    } catch (err) {
      console.warn('Lỗi khi lưu tiers vào LocalStorage:', err);
    }
  }, [tiers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(itemsMap));
    } catch (err) {
      console.warn('Lỗi khi lưu items vào LocalStorage:', err);
    }
  }, [itemsMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TITLE_CONFIG, JSON.stringify(titleConfig));
    } catch (err) {
      console.warn('Lỗi khi lưu title config vào LocalStorage:', err);
    }
  }, [titleConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROW_HEIGHT, String(rowHeight));
    } catch (err) {
      console.warn('Lỗi khi lưu rowHeight vào LocalStorage:', err);
    }
  }, [rowHeight]);

  // Global Clipboard Paste Listener (Ctrl + V)
  useEffect(() => {
    const handlePaste = async (e) => {
      // Do not capture paste when typing in text inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      try {
        const newItems = await processClipboardEvent(e);
        if (newItems.length > 0) {
          e.preventDefault();
          if (activeTierId) {
            handleAddCustomItemsToTier(activeTierId, newItems);
            const targetTier = tiers.find(t => t.id === activeTierId);
            showToast(`Đã dán ${newItems.length} ảnh vào bậc "${targetTier?.label || 'được chọn'}"!`);
          } else {
            handleAddCustomItems(newItems);
            showToast(`Đã dán ${newItems.length} ảnh vào kho ảnh chưa xếp hạng!`);
          }
        }
      } catch (err) {
        console.error('Lỗi khi dán ảnh từ clipboard:', err);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTierId, tiers]);

  // Drop an item into a Tier (supports reordering at specific index)
  const handleDropItem = (itemId, targetTierId, sourceTierId, targetIndex = null) => {
    setTiers((prevTiers) => {
      return prevTiers.map((tier) => {
        // If it's the target tier
        if (tier.id === targetTierId) {
          const currentIds = (tier.itemIds || []).filter((id) => id !== itemId);
          if (targetIndex !== null && targetIndex >= 0 && targetIndex <= currentIds.length) {
            currentIds.splice(targetIndex, 0, itemId);
            return { ...tier, itemIds: currentIds };
          }
          return { ...tier, itemIds: [...currentIds, itemId] };
        }
        // If it's the source tier, remove the item
        if (tier.id === sourceTierId) {
          return {
            ...tier,
            itemIds: (tier.itemIds || []).filter((id) => id !== itemId)
          };
        }
        return tier;
      });
    });
  };

  // Drop an item back to the Pool
  const handleDropToPool = (itemId, sourceTierId) => {
    if (!sourceTierId || sourceTierId === 'pool') return;
    setTiers((prevTiers) => {
      return prevTiers.map((tier) => {
        if (tier.id === sourceTierId) {
          return {
            ...tier,
            itemIds: (tier.itemIds || []).filter((id) => id !== itemId)
          };
        }
        return tier;
      });
    });
  };

  // Quick Assign (from click modal)
  const handleAssignToTier = (itemId, targetTierId) => {
    if (targetTierId === 'pool') {
      setTiers((prevTiers) =>
        prevTiers.map((t) => ({
          ...t,
          itemIds: (t.itemIds || []).filter((id) => id !== itemId)
        }))
      );
      return;
    }

    setTiers((prevTiers) =>
      prevTiers.map((tier) => {
        if (tier.id === targetTierId) {
          const ids = (tier.itemIds || []).filter((id) => id !== itemId);
          return { ...tier, itemIds: [...ids, itemId] };
        }
        return {
          ...tier,
          itemIds: (tier.itemIds || []).filter((id) => id !== itemId)
        };
      })
    );
  };

  const handleItemClick = (item, sourceTierId) => {
    setQuickAssignData({ item, currentTierId: sourceTierId || 'pool' });
  };

  // Row Movement
  const handleMoveTierUp = (tierId) => {
    setTiers((prev) => {
      const index = prev.findIndex((t) => t.id === tierId);
      if (index <= 0) return prev;
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleMoveTierDown = (tierId) => {
    setTiers((prev) => {
      const index = prev.findIndex((t) => t.id === tierId);
      if (index === -1 || index >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // Add / Edit / Delete Tiers
  const handleAddNewTier = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'S'];
    const currentLabels = tiers.map((t) => t.label);
    const nextLabel = letters.find((l) => !currentLabels.includes(l)) || `Bậc ${tiers.length + 1}`;
    const nextColor = COLOR_PALETTE[tiers.length % COLOR_PALETTE.length];

    const newTier = {
      id: generateId('tier'),
      label: nextLabel,
      color: nextColor,
      itemIds: []
    };
    setTiers((prev) => [...prev, newTier]);
    showToast(`Đã thêm bậc "${nextLabel}"!`);
  };

  const handleAddTierAbove = (targetTierId) => {
    const index = tiers.findIndex((t) => t.id === targetTierId);
    if (index === -1) return;
    const newTier = {
      id: generateId('tier'),
      label: 'Mới',
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      itemIds: []
    };
    const updated = [...tiers];
    updated.splice(index, 0, newTier);
    setTiers(updated);
  };

  const handleAddTierBelow = (targetTierId) => {
    const index = tiers.findIndex((t) => t.id === targetTierId);
    if (index === -1) return;
    const newTier = {
      id: generateId('tier'),
      label: 'Mới',
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
      itemIds: []
    };
    const updated = [...tiers];
    updated.splice(index + 1, 0, newTier);
    setTiers(updated);
  };

  const handleUpdateTier = (tierId, updates) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, ...updates } : t))
    );
  };

  const handleEditLabel = (tierId, newLabel) => {
    handleUpdateTier(tierId, { label: newLabel });
  };

  const handleClearTier = (tierId) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, itemIds: [] } : t))
    );
  };

  const handleDeleteTier = (tierId) => {
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  };

  // Clear all items to pool
  const handleClearAllToPool = () => {
    if (window.confirm('Bạn có chắc muốn đưa tất cả ảnh đã xếp hạng trở lại kho ảnh?')) {
      setTiers((prev) => prev.map((t) => ({ ...t, itemIds: [] })));
      showToast('Đã đưa tất cả ảnh về kho!');
    }
  };

  // Reset entire application to initial state
  const handleResetAll = () => {
    localStorage.removeItem(STORAGE_KEY_TIERS);
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_TITLE_CONFIG);
    localStorage.removeItem(STORAGE_KEY_ROW_HEIGHT);

    const defaultMap = {};
    DEFAULT_RAPPERS.forEach((r) => {
      defaultMap[r.id] = r;
    });

    setTitleConfig(DEFAULT_TITLE_CONFIG);
    setItemsMap(defaultMap);
    setTiers(DEFAULT_TIERS);
    setRowHeight(DEFAULT_ROW_HEIGHT);
    setActiveTierId(null);
    showToast('Đã khôi phục toàn bộ cài đặt mặc định ban đầu!');
  };

  // Reload latest default photos into pool
  const handleReloadDefaultPhotos = () => {
    setItemsMap((prev) => {
      const updated = { ...prev };
      DEFAULT_RAPPERS.forEach((r) => {
        updated[r.id] = { ...(updated[r.id] || {}), ...r };
      });
      return updated;
    });
    showToast('Đã nạp lại toàn bộ 28 ảnh rapper mới nhất!');
  };

  // Switch preset schemes
  const handleSelectPresetScheme = (scheme) => {
    const newTiers = scheme.tiers.map((st) => ({
      ...st,
      itemIds: []
    }));
    setTiers(newTiers);
    showToast(`Đã chuyển sang ${scheme.name}!`);
  };

  // Add custom items to Pool
  const handleAddCustomItems = (newItemsList) => {
    setItemsMap((prev) => {
      const next = { ...prev };
      newItemsList.forEach((item) => {
        next[item.id] = item;
      });
      return next;
    });
    showToast(`Đã thêm ${newItemsList.length} ảnh vào kho!`);
  };

  // Add custom items directly into a specific Tier ("1 ranking có thể có nhiều ảnh")
  const handleAddCustomItemsToTier = (tierId, newItemsList) => {
    setItemsMap((prev) => {
      const next = { ...prev };
      newItemsList.forEach((item) => {
        next[item.id] = item;
      });
      return next;
    });

    setTiers((prev) =>
      prev.map((t) => {
        if (t.id === tierId) {
          const newItemIds = newItemsList.map((item) => item.id);
          return {
            ...t,
            itemIds: [...(t.itemIds || []), ...newItemIds]
          };
        }
        return t;
      })
    );
    showToast(`Đã thêm ${newItemsList.length} ảnh vào bậc!`);
  };

  const handleDeleteCustomItem = (itemId) => {
    setItemsMap((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setTiers((prev) =>
      prev.map((t) => ({
        ...t,
        itemIds: (t.itemIds || []).filter((id) => id !== itemId)
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900 border border-emerald-500/80 text-white rounded-xl shadow-2xl animate-bounce-in">
          <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        title={titleConfig.text}
        onOpenExport={() => setIsExportOpen(true)}
        onAddNewTier={handleAddNewTier}
        onResetAll={handleResetAll}
        onSelectPresetScheme={handleSelectPresetScheme}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 flex flex-col">
        {/* Tier List Board (Capture target for export) */}
        <div className="bg-[#121319] rounded-xl border border-zinc-800/80 shadow-2xl overflow-hidden p-2 sm:p-4">
          <div ref={tierListRef} className="tier-board-exportable bg-[#111217] rounded-lg overflow-hidden border border-black/80">
            {/* Customizable Title Header */}
            <TitleHeader
              titleConfig={titleConfig}
              onChangeTitleConfig={setTitleConfig}
            />

            {/* Tier Rows (Matching user screenshot: A, B, C, D, E, F, G) */}
            <div className="tier-rows-container divide-y divide-black/80">
              {tiers.map((tier, index) => {
                const tierItems = (tier.itemIds || [])
                  .map((id) => itemsMap[id])
                  .filter(Boolean);

                return (
                  <TierRow
                    key={tier.id}
                    tier={tier}
                    items={tierItems}
                    isFirst={index === 0}
                    isLast={index === tiers.length - 1}
                    isActive={activeTierId === tier.id}
                    onSetActive={setActiveTierId}
                    onMoveUp={handleMoveTierUp}
                    onMoveDown={handleMoveTierDown}
                    onOpenSettings={setActiveTierForSettings}
                    onDropItem={handleDropItem}
                    onClearTier={handleClearTier}
                    onDeleteTier={handleDeleteTier}
                    onItemClick={handleItemClick}
                    onEditLabel={handleEditLabel}
                    onAddCustomItemsToTier={handleAddCustomItemsToTier}
                    onOpenAdjust={setAdjustingItem}
                    rowHeight={rowHeight}
                    cardSize={boardCardSize}
                    fitMode={boardFitMode}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Toolbar below Tier List */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1 text-xs text-zinc-400">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={handleAddNewTier}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
            >
              <Plus size={14} className="text-emerald-400" /> Thêm hàng xếp hạng
            </button>
            <button
              onClick={handleClearAllToPool}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
            >
              <RotateCcw size={14} className="text-amber-400" /> Đưa tất cả về kho
            </button>
            <button
              onClick={() => {
                if (window.confirm('Khôi phục toàn bộ bảng và ảnh về mặc định ban đầu?')) {
                  handleResetAll();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/80 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300 rounded-lg transition border border-zinc-700/60"
              title="Khôi phục toàn bộ bảng và ảnh về trạng thái ban đầu"
            >
              <RotateCcw size={14} className="text-rose-400" /> Khôi phục mặc định
            </button>
          </div>

          {/* Row Height & Sizing Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Interactive Row Height Control (matching user request: image height = ranking row height) */}
            <div className="flex items-center gap-2 bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="text-[11px] text-zinc-300 font-semibold whitespace-nowrap">
                Chiều cao dòng:
              </span>

              {/* Preset buttons */}
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-md border border-zinc-800">
                {[
                  { label: '75', val: 75, title: 'Nhỏ (75px)' },
                  { label: '95', val: 95, title: 'Chuẩn (95px)' },
                  { label: '120', val: 120, title: 'Lớn (120px)' },
                  { label: '150', val: 150, title: 'Rất lớn (150px)' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setRowHeight(preset.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                      rowHeight === preset.val
                        ? 'bg-amber-400 text-zinc-950 shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title={preset.title}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Slider for smooth adjustment */}
              <div className="flex items-center gap-1.5 pl-1">
                <input
                  type="range"
                  min="60"
                  max="160"
                  step="5"
                  value={rowHeight}
                  onChange={(e) => setRowHeight(Number(e.target.value))}
                  className="w-20 sm:w-24 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  title="Kéo trượt để chỉnh chiều cao chính xác"
                />
                <span className="font-mono text-[11px] text-amber-300 font-bold min-w-[36px]">
                  {rowHeight}px
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-md transition transform active:scale-95"
            >
              <Download size={14} /> Tải ảnh về máy (PNG)
            </button>
          </div>
        </div>

        {/* Image Bank / Unranked Items Pool */}
        <ItemPool
          items={poolItems}
          totalItemsCount={totalItemsCount}
          onDropToPool={handleDropToPool}
          onItemClick={handleItemClick}
          onAddCustomItems={handleAddCustomItems}
          onResetToDefault={handleResetAll}
          onClearAllToPool={handleClearAllToPool}
          onDeleteCustomItem={handleDeleteCustomItem}
          onReloadDefaultPhotos={handleReloadDefaultPhotos}
          onOpenAdjust={setAdjustingItem}
        />
      </main>

      {/* Footer */}
      <footer className="mt-8 border-t border-zinc-900 bg-[#090a0d] py-5 px-4 text-center text-xs text-zinc-400">
        <p>
          Ứng dụng Web Xếp Hạng TierMaker • Hỗ trợ kéo thả, chỉnh vị trí trên/dưới/trái/phải & zoom ảnh, xuất ảnh PNG 2K
        </p>
      </footer>

      {/* Modals */}
      <TierSettingsModal
        tier={activeTierForSettings}
        isOpen={Boolean(activeTierForSettings)}
        onClose={() => setActiveTierForSettings(null)}
        onUpdateTier={handleUpdateTier}
        onAddTierAbove={handleAddTierAbove}
        onAddTierBelow={handleAddTierBelow}
        onClearTier={handleClearTier}
        onDeleteTier={handleDeleteTier}
        itemCount={
          activeTierForSettings
            ? (activeTierForSettings.itemIds || []).length
            : 0
        }
      />

      <QuickAssignModal
        item={quickAssignData?.item}
        currentTierId={quickAssignData?.currentTierId}
        tiers={tiers}
        isOpen={Boolean(quickAssignData)}
        onClose={() => setQuickAssignData(null)}
        onAssignToTier={handleAssignToTier}
        onOpenAdjust={setAdjustingItem}
      />

      <ImageAdjustModal
        item={adjustingItem}
        isOpen={Boolean(adjustingItem)}
        onClose={() => setAdjustingItem(null)}
        onSaveAdjustments={handleSaveAdjustments}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tierListRef={tierListRef}
        title={titleConfig.text}
        titleConfig={titleConfig}
        tiers={tiers}
        itemsMap={itemsMap}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
