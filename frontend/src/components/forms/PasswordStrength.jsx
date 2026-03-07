const rules = [
  { label: 'Мінімум 6 символів', test: (v) => v.length >= 6 },
  { label: 'Велика літера', test: (v) => /[A-Z]/.test(v) },
  { label: 'Цифра', test: (v) => /\d/.test(v) },
];

export const PasswordStrength = ({ password }) => {
  if (!password) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-1 mt-1">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={`text-xs flex items-center gap-1 ${
            rule.test(password) ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <span>{rule.test(password) ? '✓' : '○'}</span>
          {rule.label}
        </li>
      ))}
    </ul>
  );
};
