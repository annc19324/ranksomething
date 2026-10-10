import React, { useState, useRef } from 'react';
import { Download, X, Check, Loader2, Sparkles, Smartphone, Monitor, Square, Copy, ZoomIn, ShieldCheck } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import confetti from 'canvas-confetti';
import { 
  STORAGE_KEY_EXPORT_ASPECT_RATIO, 
  STORAGE_KEY_TIKTOK_ROW_HEIGHT, 
  DEFAULT_TIKTOK_ROW_HEIGHT 
} from '../constants';
import { getContrastTextColor } from '../utils/colorUtils';

/**
 * Ensures all images inside a container are fully loaded before capturing
 */
const waitForImages = async (container) => {
  if (!container) return;
  const imgs = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        setTimeout(resolve, 800); // 800ms safety timeout
      });
    })
  );
};

/**
 * Renders a high-res snapshot into a 9:16 TikTok canvas or 1:1 Square canvas
 */
const renderFramedSnapshot = async (rawSnapshotUrl, targetRatio, format = 'png', includeBadge = true) => {
  if (targetRatio === 'original') {
    return rawSnapshotUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    // Do NOT set crossOrigin on data: or blob: URIs to prevent canvas tainting
    if (!rawSnapshotUrl.startsWith('data:') && !rawSnapshotUrl.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        let canvasWidth = 1080;
        let canvasHeight = 1920;

        if (targetRatio === 'square') {
          canvasWidth = 1080;
          canvasHeight = 1080;
        }

        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawSnapshotUrl);
          return;
        }

        // Enable ultra-high bicubic smoothing for razor-sharp rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (targetRatio === 'tiktok') {
          // --- TikTok 9:16 Vertical Canvas (1080 x 1920) ---
          // 1. Rich dark gradient background
          const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          bgGrad.addColorStop(0, '#090a0f');
          bgGrad.addColorStop(0.25, '#12141c');
          bgGrad.addColorStop(0.75, '#12141c');
          bgGrad.addColorStop(1, '#07080b');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Subtle ambient glow centered on the board
          const glow = ctx.createRadialGradient(
            canvasWidth / 2,
            canvasHeight * 0.42,
            100,
            canvasWidth / 2,
            canvasHeight * 0.42,
            600
          );
          glow.addColorStop(0, 'rgba(251, 191, 36, 0.12)');
          glow.addColorStop(0.6, 'rgba(99, 102, 241, 0.05)');
          glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // 2. Top Header Badge
          if (includeBadge) {
            const badgeW = 290;
            const badgeH = 46;
            const badgeX = (canvasWidth - badgeW) / 2;
            const badgeY = 90;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (typeof ctx.roundRect === 'function') {
              ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 23);
            } else {
              ctx.rect(badgeX, badgeY, badgeW, badgeH);
            }
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 17px Inter, system-ui, -apple-system, sans-serif';
            ctx.fillStyle = '#fbbf24';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨ BẢNG XẾP HẠNG ✨', canvasWidth / 2, badgeY + badgeH / 2);
            ctx.restore();
          }

          // 3. Tier Board Sizing with Safe TikTok Margins:
          // Board takes up 1040px width (96% of phone screen)
          let drawWidth = 1040;
          let drawHeight = img.height * (drawWidth / img.width);

          const maxAvailableHeight = 1640;
          if (drawHeight > maxAvailableHeight) {
            drawHeight = maxAvailableHeight;
            drawWidth = img.width * (drawHeight / img.height);
          }

          const drawX = (canvasWidth - drawWidth) / 2;
          const drawY = includeBadge 
            ? 155 + Math.max(0, (1420 - drawHeight) * 0.2)
            : 105 + Math.max(0, (1480 - drawHeight) * 0.2);

          // Drop shadow behind the board
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 45;
          ctx.shadowOffsetY = 18;
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          // Outer border
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          // 4. Bottom Footer Note
          if (includeBadge && canvasHeight - (drawY + drawHeight) > 85) {
            ctx.save();
            ctx.font = '500 15px Inter, system-ui, -apple-system, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📱 TikTok Format • Vuốt để xem', canvasWidth / 2, canvasHeight - 75);
            ctx.restore();
          }

          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          resolve(canvas.toDataURL(mimeType, 0.98));
          return;
        }

        if (targetRatio === 'square') {
          // --- Square 1:1 Canvas (1080 x 1080) ---
          const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          bgGrad.addColorStop(0, '#0c0e14');
          bgGrad.addColorStop(1, '#08090c');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          const availableW = canvasWidth - 60;
          const availableH = canvasHeight - 60;

          let drawW = availableW;
          let drawH = img.height * (drawW / img.width);

          if (drawH > availableH) {
            drawH = availableH;
            drawW = img.width * (drawH / img.height);
          }

          const drawX = (canvasWidth - drawW) / 2;
          const drawY = (canvasHeight - drawH) / 2;

          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 35;
          ctx.shadowOffsetY = 14;
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          resolve(canvas.toDataURL(mimeType, 0.98));
          return;
        }

        resolve(rawSnapshotUrl);
      } catch (err) {
        console.error('Lỗi khi vẽ khung hình:', err);
        resolve(rawSnapshotUrl);
      }
    };
    img.onerror = (e) => {
      console.warn('Lỗi nạp ảnh canvas, dùng ảnh gốc:', e);
      resolve(rawSnapshotUrl);
    };
    img.src = rawSnapshotUrl;
  });
};

export default function ExportModal({
  isOpen,
  onClose,
  tierListRef,
  title,
  titleConfig,
  tiers = [],
  itemsMap = {}
}) {
  if (!isOpen) return null;

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [format, setFormat] = useState('png'); // 'png' or 'jpeg'
  const [includeBadge, setIncludeBadge] = useState(true);
  const [copied, setCopied] = useState(false);

  // Hidden ref for dedicated mobile/TikTok optimized board
  const tiktokBoardRef = useRef(null);

  // Aspect ratio state initialized from localStorage
  const [aspectRatio, setAspectRatio] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPORT_ASPECT_RATIO);
      if (saved && ['tiktok', 'original', 'square'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'tiktok';
  });

  // Dedicated TikTok row height (controls how big photos & rows are on TikTok)
  const [tiktokRowHeight, setTiktokRowHeight] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIKTOK_ROW_HEIGHT);
      if (saved) return Number(saved);
    } catch (e) {}
    return DEFAULT_TIKTOK_ROW_HEIGHT; // 160px default (Huge and readable on mobile!)
  });

  // Switch and persist aspect ratio choice
  const handleSelectAspectRatio = (ratio) => {
    setAspectRatio(ratio);
    try {
      localStorage.setItem(STORAGE_KEY_EXPORT_ASPECT_RATIO, ratio);
    } catch (e) {}
    setDownloadUrl(null);
  };

  // Switch and persist TikTok row height
  const handleSelectTiktokRowHeight = (val) => {
    setTiktokRowHeight(val);
    try {
      localStorage.setItem(STORAGE_KEY_TIKTOK_ROW_HEIGHT, String(val));
    } catch (e) {}
    setDownloadUrl(null);
  };

  const generateImage = async () => {
    setIsGenerating(true);
    setDownloadUrl(null);

    try {
      let finalDataUrl = null;

      if (aspectRatio === 'tiktok') {
        let tiktokBoardRaw = null;

        // Try high-res capture of dedicated mobile TikTok board
        if (tiktokBoardRef.current) {
          try {
            await waitForImages(tiktokBoardRef.current);
            tiktokBoardRaw = await toPng(tiktokBoardRef.current, {
              pixelRatio: 3, // Ultra 4K sharpness
              backgroundColor: '#111217',
              cacheBust: true
            });
          } catch (e) {
            console.warn('Không thể chụp board offscreen, chuyển sang fallback:', e);
          }
        }

        // If offscreen capture was empty or failed, fallback to tierListRef
        if (!tiktokBoardRaw || tiktokBoardRaw.length < 500) {
          const filter = (node) => !node?.classList?.contains('tier-row-controls');
          tiktokBoardRaw = await toPng(tierListRef.current, {
            filter,
            pixelRatio: 3,
            backgroundColor: '#0c0d12',
            cacheBust: true
          });
        }

        finalDataUrl = await renderFramedSnapshot(
          tiktokBoardRaw,
          'tiktok',
          format,
          includeBadge
        );
      } else {
        // --- ORIGINAL OR SQUARE: Capture standard desktop board ---
        if (!tierListRef.current) return;
        const filter = (node) => {
          if (node?.classList?.contains('tier-row-controls')) return false;
          return true;
        };

        const options = {
          filter,
          pixelRatio: 3, // Ultra 4K sharpness
          backgroundColor: '#0c0d12',
          cacheBust: true,
          style: { borderRadius: '0px' }
        };

        let rawDataUrl;
        if (format === 'jpeg') {
          rawDataUrl = await toJpeg(tierListRef.current, { ...options, quality: 0.98 });
        } else {
          rawDataUrl = await toPng(tierListRef.current, options);
        }

        finalDataUrl = await renderFramedSnapshot(
          rawDataUrl,
          aspectRatio,
          format,
          includeBadge
        );
      }

      setDownloadUrl(finalDataUrl);

      // Trigger Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Automatically trigger download
      const link = document.createElement('a');
      const safeTitle = (title || 'tier-list')
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-');

      const ratioTag = aspectRatio === 'tiktok' ? '-tiktok-9x16' : aspectRatio === 'square' ? '-square-1x1' : '';
      link.download = `${safeTitle}${ratioTag}-${Date.now()}.${format}`;
      link.href = finalDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Lỗi khi xuất ảnh:', err);
      alert('Không thể xuất ảnh: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    if (!downloadUrl) return;
    try {
      const res = await fetch(downloadUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Không thể sao chép vào clipboard', err);
      alert('Trình duyệt không hỗ trợ sao chép ảnh trực tiếp. Vui lòng tải về máy!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Hidden Mobile/TikTok Board Container - painted at top: 0, left: 0 behind page with zIndex -9999 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1040px',
          zIndex: -9999,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
        aria-hidden="true"
      >
        <div
          ref={tiktokBoardRef}
          style={{
            width: '1040px',
            backgroundColor: '#111217',
            borderRadius: '16px',
            border: '2px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95)',
            overflow: 'hidden',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Title Header matching user titleConfig */}
          <div className="py-4 px-6 bg-[#161822] border-b-2 border-black flex items-center justify-center text-center">
            <h1
              style={{
                color: titleConfig?.color || '#fbbf24',
                textAlign: titleConfig?.align || 'center'
              }}
              className="font-black text-3xl sm:text-4xl tracking-wide uppercase drop-shadow-md"
            >
              {titleConfig?.text || title || 'BẢNG XẾP HẠNG'}
            </h1>
          </div>

          {/* Tiers Container */}
          <div className="divide-y-2 divide-black">
            {tiers.map((tier) => {
              const tierItems = (tier.itemIds || [])
                .map((id) => itemsMap[id])
                .filter(Boolean);

              const textColor = getContrastTextColor(tier.color);
              const labelBoxWidth = Math.max(120, Math.round(tiktokRowHeight * 0.95));

              return (
                <div
                  key={tier.id}
                  style={{ minHeight: `${tiktokRowHeight}px` }}
                  className="flex flex-row items-stretch bg-[#14151a]"
                >
                  {/* Tier Label Box (Huge and bold on mobile!) */}
                  <div
                    style={{
                      backgroundColor: tier.color,
                      color: textColor,
                      width: `${labelBoxWidth}px`,
                      minWidth: `${labelBoxWidth}px`,
                      minHeight: `${tiktokRowHeight}px`
                    }}
                    className="flex items-center justify-center p-3 select-none flex-shrink-0"
                  >
                    <span className="font-black text-4xl sm:text-5xl tracking-tight text-center drop-shadow-md">
                      {tier.label}
                    </span>
                  </div>

                  {/* Drop Zone / Items (Large photos!) */}
                  <div
                    style={{ minHeight: `${tiktokRowHeight}px` }}
                    className="flex-1 flex flex-wrap content-start items-center gap-2 p-1.5 bg-[#121318]"
                  >
                    {tierItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          height: `${tiktokRowHeight}px`,
                          width: 'auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        className="relative flex-shrink-0 rounded-lg overflow-hidden bg-zinc-950 border border-zinc-700/80 shadow-md"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="pointer-events-none select-none block max-w-none"
                          style={{
                            height: `${tiktokRowHeight}px`,
                            width: 'auto',
                            maxWidth: 'none',
                            objectFit: 'contain',
                            transform: (item.zoom !== 100 || item.posX !== 0 || item.posY !== 0)
                              ? `scale(${(item.zoom ?? 100) / 100}) translate(${item.posX ?? 0}%, ${item.posY ?? 0}%)`
                              : undefined,
                            transformOrigin: 'center center'
                          }}
                        />
                        {item.name && !item.name.toLowerCase().includes('clipboard') && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-1 pt-3 text-center pointer-events-none">
                            <p className="text-xs font-bold text-white truncate drop-shadow-sm leading-tight px-1.5">
                              {item.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Modal Dialog */}
      <div 
        className="w-full max-w-lg bg-[#181a20] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#121318]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Download size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Tải Bảng Xếp Hạng Về Máy</h3>
              <p className="text-xs text-zinc-400">Hỗ trợ khung hình TikTok 9:16 & Siêu Nét 4K UHD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Aspect Ratio Selector */}
          <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Smartphone size={14} className="text-amber-400" /> Chọn khung hình xuất ảnh:
              </span>
              <span className="text-[10px] text-amber-400/90 font-medium">
                ✓ Tự nhớ lựa chọn cuối
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* TikTok 9:16 button */}
              <button
                type="button"
                onClick={() => handleSelectAspectRatio('tiktok')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                  aspectRatio === 'tiktok'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/50 shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Smartphone size={14} className={aspectRatio === 'tiktok' ? 'text-amber-400' : 'text-zinc-500'} />
                  <span className="text-sm font-black">9:16</span>
                </div>
                <span className="text-xs font-bold leading-tight">TikTok / Reels</span>
                <span className="text-[10px] opacity-75">To rõ, vừa khít điện thoại</span>
              </button>

              {/* Original landscape button */}
              <button
                type="button"
                onClick={() => handleSelectAspectRatio('original')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                  aspectRatio === 'original'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/50 shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Monitor size={14} className={aspectRatio === 'original' ? 'text-amber-400' : 'text-zinc-500'} />
                  <span className="text-sm font-black">Ngang</span>
                </div>
                <span className="text-xs font-bold leading-tight">Ngang chuẩn</span>
                <span className="text-[10px] opacity-75">Tỉ lệ gốc bảng</span>
              </button>

              {/* Square 1:1 button */}
              <button
                type="button"
                onClick={() => handleSelectAspectRatio('square')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition ${
                  aspectRatio === 'square'
                    ? 'bg-amber-400/15 border-amber-400 text-amber-300 ring-1 ring-amber-400/50 shadow-md'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Square size={13} className={aspectRatio === 'square' ? 'text-amber-400' : 'text-zinc-500'} />
                  <span className="text-sm font-black">1:1</span>
                </div>
                <span className="text-xs font-bold leading-tight">Vuông Post</span>
                <span className="text-[10px] opacity-75">Vuông 1080×1080</span>
              </button>
            </div>

            {/* TikTok Zoom / Size Controls when TikTok mode is selected */}
            {aspectRatio === 'tiktok' && (
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-semibold flex items-center gap-1">
                    <ZoomIn size={13} className="text-amber-400" /> Độ to ảnh & dòng trên TikTok:
                  </span>
                  <span className="font-mono text-amber-300 font-bold">{tiktokRowHeight}px</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[
                      { label: 'Vừa', val: 140 },
                      { label: 'To rõ', val: 160 },
                      { label: 'Cực đại', val: 180 },
                    ].map((sz) => (
                      <button
                        key={sz.val}
                        type="button"
                        onClick={() => handleSelectTiktokRowHeight(sz.val)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                          tiktokRowHeight === sz.val
                            ? 'bg-amber-400 text-zinc-950 shadow'
                            : 'bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="120"
                    max="190"
                    step="5"
                    value={tiktokRowHeight}
                    onChange={(e) => handleSelectTiktokRowHeight(Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    title="Kéo trượt để điều chỉnh độ to của ảnh trên TikTok"
                  />
                </div>

                <div className="pt-1.5 text-[11px] text-zinc-400 flex items-center justify-between border-t border-zinc-900">
                  <span>Huy hiệu tiêu đề & safe zone:</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBadge}
                      onChange={(e) => {
                        setIncludeBadge(e.target.checked);
                        setDownloadUrl(null);
                      }}
                      className="accent-amber-400 w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    <span className="text-zinc-300">Bật huy hiệu</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Format & Resolution Settings */}
          <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Định dạng & độ nét:
            </h4>

            {/* Format choice */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Định dạng ảnh:</span>
              <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setFormat('png');
                    setDownloadUrl(null);
                  }}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    format === 'png' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  PNG (Khuyên dùng)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormat('jpeg');
                    setDownloadUrl(null);
                  }}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    format === 'jpeg' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  JPEG
                </button>
              </div>
            </div>

            {/* Resolution indicator with Ultra 4K badge */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-300 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" /> Chất lượng xuất ảnh:
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> Siêu Nét 4K (3x Retina)
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={generateImage}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Đang tạo ảnh siêu nét 4K...
              </>
            ) : (
              <>
                <Download size={18} />
                <span>
                  Tải ngay {aspectRatio === 'tiktok' ? '(Khung TikTok 9:16 Siêu Nét)' : aspectRatio === 'square' ? '(Khung Vuông 1:1)' : '(Khung Ngang 4K)'}
                </span>
              </>
            )}
          </button>

          {/* Preview if generated */}
          {downloadUrl && (
            <div className="pt-2 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Đã xuất ảnh siêu rõ nét & lưu về máy!
                </span>
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md transition"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Đã chép vào clipboard!' : 'Sao chép ảnh'}
                </button>
              </div>

              <div className={`rounded-lg overflow-hidden border border-zinc-700 bg-black/50 p-2 flex items-center justify-center ${
                aspectRatio === 'tiktok' ? 'max-h-72' : 'max-h-48'
              }`}>
                <img 
                  src={downloadUrl} 
                  alt="Tier list preview" 
                  className={`w-auto object-contain rounded shadow-lg ${
                    aspectRatio === 'tiktok' ? 'max-h-68' : 'max-h-44'
                  }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#121318] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
