import axios from 'axios';

const apiClient = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Automatically attach CSRF token if running in browser
if (typeof document !== 'undefined') {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
        apiClient.defaults.headers.common['X-CSRF-TOKEN'] = token;
    }
}

export default apiClient;
