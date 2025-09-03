import axios from 'axios';

const axiosService = axios.create({
    headers: {
    'Content-Type': 'application/json',
},
});

//Interceptor para agregar el token a cada request
axiosService.interceptors.request.use(
    (config) => {
        return config;
        //const token = localStorage.getItem('accessToken');
        //if (token) {
        //    config.headers.Authorization = `Bearer ${token}`;
            //config.headers.Authorization = token;
        //    }return config;
        },
    (error) => {
        return Promise.reject(error);
    }
);
export default axiosService;