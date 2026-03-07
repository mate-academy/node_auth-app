export const Loader = ({ centered }) => {
  return (
    <div className={centered ? 'flex justify-center py-10' : 'inline-flex'}>
      <sv
        className="animate-spin h-6 w-6 text-blue-600"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </sv>
    </div>
  );
};
