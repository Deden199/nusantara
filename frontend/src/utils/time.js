export function formatTime(timeStr) {
  if (!timeStr) return '';
  // Assume timeStr in 'HH:mm' format
  const [hour = '', minute = ''] = timeStr.split(':');
  const hh = hour.padStart(2, '0');
  const mm = minute.padStart(2, '0');
  return `${hh}:${mm} WIB`;
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const options = {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  const formatted = new Intl.DateTimeFormat('id-ID', options).format(date);
  return `${formatted} WIB`;
}
