const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  name,
  autoComplete,
}) => {
  const id = name || placeholder || Math.random().toString(36).slice(2, 9);

  let auto = autoComplete;
  if (!auto) {
    if (name === 'email') auto = 'email';
    else if (type === 'password') {
      if (name && /new/i.test(name)) auto = 'new-password';
      else auto = 'current-password';
    } else {
      auto = 'on';
    }
  }

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
      </label>

      <div className="control">
        <input
          id={id}
          className={`input ${error ? 'is-danger' : ''}`}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={auto}
        />
      </div>

      {error && <p className="help is-danger">{error}</p>}
    </div>
  );
};

export default Input;
