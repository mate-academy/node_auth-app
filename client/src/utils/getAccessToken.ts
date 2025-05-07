export function getAccessToken () {
  const row = localStorage.getItem('auth');
  
  return row ? JSON.parse(row).accessToken : null;
}
