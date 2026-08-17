const Button = ({
  children,
  type = 'button',
  loading = false,
  color = 'primary',
  fullWidth = true,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`button is-${color} ${fullWidth ? 'is-fullwidth' : ''}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
