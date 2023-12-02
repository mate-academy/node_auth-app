function email(value) {
  const emailPattern = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  return emailPattern.test(value);
}

function password(value) {
  return value.length > 5;
}

export const validation = {
  email,
  password,
};
