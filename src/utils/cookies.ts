import http from 'http';

type Cookies = Record<string, string>;

function parseCookies(req: http.IncomingMessage): Cookies {
  const cookieHeader = req.headers.cookie || '';

  return Object.fromEntries(
    cookieHeader
      .split(';')
      .filter(Boolean)
      .map((c) => {
        const [key, ...val] = c.trim().split('=');

        return [key, val.join('=')];
      }),
  );
}

export default parseCookies;
