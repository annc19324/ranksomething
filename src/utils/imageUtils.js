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

        let cleanName = file.name
          ? file.name.replace(/\.[^/.]+$/, '').trim()
          : '';
        if (cleanName.toLowerCase().includes('clipboard')) {
          cleanName = '';
        }

        resolve({
          id: generateId('custom'),
          name: cleanName,
          image: dataUrl,
          subtitle: cleanName ? 'Tự tải lên' : '',
          isCustom: true
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
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
