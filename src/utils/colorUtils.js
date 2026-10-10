// Utility to calculate contrast text color (black or white) based on background hex
export function getContrastTextColor(hexColor) {
  if (!hexColor) return '#000000';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111827' : '#ffffff';
}

// Generate unique ID
export function generateId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}
