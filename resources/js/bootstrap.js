import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.request.use(function (config) {
    if (!config.headers) {
        config.headers = {};
    }
    if (!config.headers.common) {
        config.headers.common = {};
    }
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token && token.content) {
        config.headers.common['X-CSRF-TOKEN'] = token.content;
    }
    return config;
});

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});
