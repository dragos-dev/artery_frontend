import axios from "axios";

export const $api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API,
	withCredentials: true,
});

$api.interceptors.request.use((config) => {
	config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
	return config;
});

$api.interceptors.response.use(
	(config) => {
		return config;
	},
	async (error) => {
		const originalRequest = error.config;
		console.log(error.response);
		if (error.response.status == 401 && !originalRequest._isRetry) {
			originalRequest._isRetry = true;
			try {
				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API}/api/auth/refresh`,
					{},
					{ withCredentials: true },
				);
				localStorage.setItem("token", response.data.accessToken);
				return $api.request(originalRequest);
			} catch (e) {
				localStorage.clear();
				console.log(`User unauthorized: ${e}`);
			}
		}
		throw error;
	},
);
