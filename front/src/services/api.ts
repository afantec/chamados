import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg =
            error.response?.data?.message ||
            error.response?.data?.errors?.join(', ') ||
            'Ocorreu um erro inesperado.';
        return Promise.reject(new Error(msg));
    }
);

export default api;
