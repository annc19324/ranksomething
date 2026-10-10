import { generateId } from './colorUtils';

/**
 * Resizes an image file to a maximum dimension to optimize performance
 * and prevent exceeding browser localStorage limits.
 */
export function processImageFile(file, maxDimension = 320) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('File không phải là định dạng hình ảnh hợp lệ.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lỗi khi đọc file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Lỗi khi tải hình ảnh.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with 0.88 quality or PNG if transparent
        const isPng = file.type === 'image/png';
        const dataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.88);

        // Do not store arbitrary disk filenames (such as 'hqdefault', 'image', etc.)
        // as the item's display label. Custom uploaded images should remain clean without unwanted label overlays.
        resolve({
          id: generateId('custom'),
          name: '',
          image: dataUrl,
          subtitle: '',
          isCustom: true
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Determines whether an item should display a text label overlay.
 * Custom uploaded images, filenames, and generic labels like 'hqdefault', 'clipboard',
 * 'ảnh url', etc. are strictly excluded.
 */
export function shouldShowItemName(item) {
  if (!item) return false;
  // Custom items should NEVER display a bottom label overlay
  if (item.isCustom) return false;
  if (item.id && (String(item.id).startsWith('custom_') || String(item.id).startsWith('url_'))) {
    return false;
  }

  const name = item.name ? String(item.name).trim() : '';
  if (!name) return false;

  const lower = name.toLowerCase();

  // Keyword check: blacklist any filename / placeholder / generic notes
  const blockedKeywords = [
    'clipboard',
    'hqdefault',
    'maxresdefault',
    'sddefault',
    'mqdefault',
    'default',
    'ảnh url',
    'ảnh tải lên',
    'tự tải lên',
    'ảnh custom',
    'image',
    'download',
    'screenshot',
    'unnamed',
    'thumb',
    'thumbnail',
    'photo',
    'picture'
  ];

  if (blockedKeywords.some((kw) => lower.includes(kw))) {
    return false;
  }

  // Any text containing file extension pattern: .jpg, .jpeg, .png, .webp, .svg, .avif, .gif, .bmp
  if (/\.(jpe?g|png|webp|gif|svg|avif|bmp)$/i.test(lower)) {
    return false;
  }

  return true;
}


/**
 * Process multiple files concurrently
 */
export async function processMultipleImageFiles(files, maxDimension = 320) {
  const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (fileArray.length === 0) return [];
  const promises = fileArray.map(f => processImageFile(f, maxDimension));
  return await Promise.all(promises);
}

/**
 * Extracts image files from clipboard paste event
 */
export async function processClipboardEvent(event, maxDimension = 320) {
  const items = event.clipboardData?.items;
  if (!items) return [];

  const imageFiles = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (blob) {
        // Create clean file without any 'Ảnh Clipboard' label
        const namedFile = new File([blob], '', { type: blob.type });
        imageFiles.push(namedFile);
      }
    }
  }

  if (imageFiles.length === 0) return [];
  return await processMultipleImageFiles(imageFiles, maxDimension);
}
