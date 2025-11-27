const BASE_URL = 'http://localhost:3000/api/v1';

function buildHeaders(customHeaders = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...customHeaders };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers || {}),
  });

  if (response.status === 403) {
    const data = await safeJson(response);
    const message = data?.msg || data?.error || 'Akses ditolak. Pastikan akun Anda memiliki izin yang sesuai.';
    alert(message);
    throw new Error(message);
  }

  if (!response.ok) {
    const data = await safeJson(response);
    const message = data?.msg || data?.error || 'Permintaan gagal diproses.';
    throw new Error(message);
  }

  return safeJson(response);
}

async function safeJson(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}