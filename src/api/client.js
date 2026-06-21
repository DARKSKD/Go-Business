import Cookies from 'js-cookie';

const AUTH_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin';
const REFERRALS_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals';

export async function login(email, password) {
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.message || 'Invalid email or password';
    throw new Error(message);
  }
  return json?.data?.token;
}

export async function fetchReferrals({ search, sort, id } = {}) {
  const token = Cookies.get('jwt_token');
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  if (id !== undefined && id !== null) params.set('id', id);
  const qs = params.toString();
  const url = qs ? `${REFERRALS_URL}?${qs}` : REFERRALS_URL;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = json?.message || 'Request failed';
    const error = new Error(`${message}${res.status ? ` (${res.status})` : ''}`);
    error.status = res.status;
    throw error;
  }
  const data = json?.data ?? json;
  return data;
}
