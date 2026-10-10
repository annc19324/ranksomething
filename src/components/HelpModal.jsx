import React from 'react';
import { X, MousePointer, Upload, Download, Sparkles, Clipboard, Palette, AlignCenter, RotateCcw } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#181a20] border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-lg text-white">Hướng dẫn sử dụng TierMaker VN</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <MousePointer size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white">1. Kéo thả & Chọn nhanh ảnh</h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                Kéo thả các rapper giữa các hàng hoặc kho ảnh. 1 bậc có thể chứa <strong className="text-white">vô số ảnh</strong>. Bạn cũng có thể <strong className="text-amber-400">click vào thẻ ảnh</strong> để chọn nhanh bậc đích.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Upload size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white">2. Thêm ảnh từ máy tính (Kéo file / Chọn file)</h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                Kéo trực tiếp file ảnh từ máy tính vào bất kỳ bậc nào hoặc kho ảnh. Trong mỗi hàng đều có nút <strong className="text-white">"Chọn ảnh từ máy"</strong> hoặc nút <strong className="text-white">"+"</strong> để thêm nhiều ảnh cùng lúc.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Clipboard size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white">3. Dán ảnh siêu nhanh (Ctrl + V)</h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                Chụp màn hình hoặc sao chép bất kỳ hình ảnh nào, sau đó chỉ cần bấm phím <strong className="text-cyan-400 font-mono">Ctrl + V</strong> trên bàn phím để tự động dán ảnh vào bảng xếp hạng!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlignCenter size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white">4. Chỉnh sửa tiêu đề (Màu sắc, căn trái / phải / giữa)</h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                Bấm vào biểu tượng cài đặt cạnh tiêu đề để đổi màu chữ, đổi cỡ chữ và căn lề <strong className="text-white">Trái, Giữa, hoặc Phải</strong> theo ý muốn.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Download size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white">5. Tải ảnh về máy (Download PNG 2K)</h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                Nhấn nút <strong className="text-emerald-400">"TẢI ẢNH VỀ MÁY"</strong> ở góc trên bên phải để xuất bảng xếp hạng thành ảnh PNG sắc nét không vỡ hạt để chia sẻ.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center">
              <RotateCcw size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-white">6. Tự động lưu & Khôi phục mặc định</h4>
              <p className="text-zinc-400 text-xs mt-0.5">
                Mọi thay đổi đều được <strong className="text-white">tự động lưu</strong>, F5 reload không bị mất. Nếu muốn trở về ban đầu, hãy nhấn nút <strong className="text-rose-400">"Khôi phục mặc định"</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow transition"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
