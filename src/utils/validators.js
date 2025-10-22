exports.isStrongPassword = (pw) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw || '');
exports.isValidEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || '');
