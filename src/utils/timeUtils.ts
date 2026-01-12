/**
 * 将秒数格式化为 HH:MM:SS 格式
 * @param seconds - 秒数
 * @returns 格式化后的时间字符串
 */
export function formatSecondsToHMS(seconds: number): string {
  if (seconds < 0) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const hDisplay = h > 0 ? h.toString().padStart(2, '0') + ':' : '';
  const mDisplay = (h > 0 ? m.toString().padStart(2, '0') : m.toString()).padStart(h > 0 ? 2 : 1, '0') + ':';
  const sDisplay = s.toString().padStart(2, '0');
  
  return hDisplay + mDisplay + sDisplay;
}

/**
 * 格式化日期显示为中文本地格式
 * @param dateString - 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('zh-CN');
}