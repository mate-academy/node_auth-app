exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  // 1. Check for required fields
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // 2. Simple email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // 3. Password rules check (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters long and ' +
        'include an uppercase letter, a lowercase letter, and a number.',
    });
  }

  // If everything is fine, move to the controller
  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};
