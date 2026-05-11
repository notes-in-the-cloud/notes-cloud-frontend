export function combineDateTime(date: string, time: string): Date {
  const t = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${t}`);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeStr(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTimeLabel(d: Date, now: Date): string {
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow); dayAfter.setDate(dayAfter.getDate() + 1);
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  if (d >= today && d < tomorrow)
     return `Today, ${time}`;
  if (d >= tomorrow && d < dayAfter) 
    return `Tomorrow, ${time}`;
  return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function relativeLabel(d: Date, now: Date): string {
  const diff = d.getTime() - now.getTime();
  const absMs = Math.abs(diff);
  const mins = Math.round(absMs / 60000);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  
  if (diff < 0) {
    if (mins < 60) 
      return `${mins} min ago`;
    if (hours < 24)
       return `${hours}h ago`;
    return `${days}d ago`;
  }
  if (mins < 60) 
    return `in ${mins} min`;
  if (hours < 24) 
    return `in ${hours}h`;
  return `in ${days}d`;
}