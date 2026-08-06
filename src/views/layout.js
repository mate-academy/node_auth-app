const renderLayout = (
  title,
  body,
  user = null,
  error = null,
  message = null,
) => {
  const nav = user
    ? `<a href="/profile">Profile</a> | <a href="/logout">Logout</a>`
    : `<a href="/login">Login</a> | <a href="/register">Register</a>`;

  const errorHtml = error
    ? `<div style="color:red; margin-bottom: 10px;">${error}</div>`
    : '';
  const messageHtml = message
    ? `<div style="color:green; margin-bottom: 10px;">${message}</div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title} - Auth App</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .nav { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc; }
        form { display: flex; flex-direction: column; max-width: 300px; margin-bottom: 20px; }
        input { margin-bottom: 10px; padding: 5px; }
        button { padding: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="nav">
        ${nav}
    </div>
    ${errorHtml}
    ${messageHtml}
    ${body}
</body>
</html>
  `;
};

module.exports = { renderLayout };
