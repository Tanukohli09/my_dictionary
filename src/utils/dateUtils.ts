export function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good evening 🌙';
  if (hour < 18) return 'Good afternoon 🌿';
  return 'Good evening 🌙';
}
