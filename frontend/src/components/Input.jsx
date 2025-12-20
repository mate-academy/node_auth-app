export default function Input({ label, name, type = 'text', value, onChange, required, placeholder, autoComplete, ...rest }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...rest}
      />
    </label>
  );
}
