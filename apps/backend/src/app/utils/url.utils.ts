export const getPath = (url: string): string => {
  const parsedUrl = new URL(url);
  let path = parsedUrl.pathname;
  if (!path || path === '/') {
    return '/';
  }
  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

export const getDomain = (url: string): string => {
  return new URL(url).hostname.split('.').slice(-2).join('.').toLowerCase();
}
