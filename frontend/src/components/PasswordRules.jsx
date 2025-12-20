import clsx from 'clsx';
import { checkPassword } from '../utils/password.js';

export default function PasswordRules({ password }) {
  const results = checkPassword(password);

  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Пароль має містити</p>
      <ul className="space-y-1 text-sm text-slate-600">
        {results.map((rule) => (
          <li key={rule.id} className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                rule.valid ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500',
              )}
            >
              {rule.valid ? '✓' : '•'}
            </span>
            <span className={rule.valid ? 'text-green-700' : undefined}>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
