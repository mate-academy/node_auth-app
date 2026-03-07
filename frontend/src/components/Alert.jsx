const styles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const Alert = ({ type = 'info', message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`text-sm px-4 py-3 rounded-md border ${styles[type]}`}>
      {message}
    </div>
  );
};
