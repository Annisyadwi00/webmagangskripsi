export function getAuth() {
  return {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    name: localStorage.getItem('name'),
    email: localStorage.getItem('email'),
    userId: localStorage.getItem('userId'),
  };
}

export function requireAuth(allowedRoles = []) {
  const auth = getAuth();

  if (!auth.token || !auth.role) {
    redirectToLogin();
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(auth.role)) {
    alert('Anda tidak memiliki akses ke halaman ini. Silakan login dengan akun yang sesuai.');
    redirectToLogin();
    return null;
  }

  return auth;
}

export function redirectToLogin() {
  window.location.href = 'login.html';
}

export function logout() {
  localStorage.clear();
  redirectToLogin();
}