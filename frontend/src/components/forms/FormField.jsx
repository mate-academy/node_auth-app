export const FormField = ({
  label,
  name: fieldName,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={fieldName}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={fieldName}
        name={fieldName}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
