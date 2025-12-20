export default function Spinner({ label = 'Завантаження...' }) {
  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
