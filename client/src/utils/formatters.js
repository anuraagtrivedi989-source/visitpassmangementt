export function dateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function statusClass(status) {
  return `status status-${status}`;
}
