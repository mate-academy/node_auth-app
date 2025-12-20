import clsx from 'clsx';

const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-rose-50 text-rose-800 border-rose-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

export default function Alert({ type = 'info', message }) {
  if (!message) {
    return null;
  }

  return (
    <div className={clsx('rounded-lg border px-4 py-3 text-sm font-medium', styles[type])}>{message}</div>
  );
}
