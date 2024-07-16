export default function({ $axios, store, redirect }) {
  $axios.onRequest(config => {
    const token = store.state.token;
    if (token) {
      config.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  $axios.onError(error => {
    if (error.response && error.response.status === 401) {
      store.dispatch('logout');
      redirect('/login');
    }
    return Promise.reject(error);
  });
}
