export const state = () => ({
  token: null
});

export const mutations = {
  setToken(state, token) {
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
  }
};

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    if (req.headers.cookie) {
      const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='));
      if (jwtCookie) {
        const token = jwtCookie.split('=')[1];
        commit('setToken', token);
      }
    }
  },
  logout({ commit }) {
    commit('clearToken');
    this.$cookies.remove('jwt');
  }
};
