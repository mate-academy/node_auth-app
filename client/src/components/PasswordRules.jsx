const PasswordRules = ({ password = '' }) => {
  const rules = [
    {
      text: 'At least 8 characters',
      valid: password.length >= 8,
    },
    {
      text: 'At least one uppercase letter',
      valid: /[A-Z]/.test(password),
    },
    {
      text: 'At least one lowercase letter',
      valid: /[a-z]/.test(password),
    },
    {
      text: 'At least one number',
      valid: /\d/.test(password),
    },
  ];

  return (
    <div className="box is-light">
      <p className="has-text-weight-semibold mb-2">Password requirements:</p>

      {rules.map((rule) => (
        <p
          key={rule.text}
          className={rule.valid ? 'has-text-success' : 'has-text-grey'}
        >
          {rule.valid ? '✓' : '○'} {rule.text}
        </p>
      ))}
    </div>
  );
};

export default PasswordRules;
