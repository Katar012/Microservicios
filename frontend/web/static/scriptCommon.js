// Centralized fetch wrapper to enforce credentials and headers
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    const config = {
        credentials: 'include',
        ...options,
        headers
    };

    return fetch(url, config);
}

function logout() {
    apiFetch('/api/logout', { method: 'POST' })
        .finally(() => {
            localStorage.removeItem('token');
            window.location.href = '/';
        });
}
