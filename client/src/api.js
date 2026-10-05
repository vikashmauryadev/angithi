
const base = import.meta.env.VITE_API_URL || '';

export async function api(path, opts = {}) {
  const token = localStorage.getItem('angithi_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const requestOptions = {
    ...opts,
    headers,
  };

  if (opts.body !== undefined) {
    requestOptions.body = JSON.stringify(opts.body);
  }

  const res = await fetch(`${base}/api${path}`, requestOptions);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}