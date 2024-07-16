export const state = () => ({
  token: null,
  tokenExpiration: null,
  userId: null,
  userRole: null
});

export const mutations = {
  setToken(state, { token, tokenExpiration }) {
    state.token = token;
    state.tokenExpiration = tokenExpiration;
  },
  clearToken(state) {
    state.token = null;
    state.tokenExpiration = null;
  },
  setUserId(state, userId) {
    state.userId = userId;
  },
  clearUserId(state) {
    state.userId = null;
  },
  setUserRole(state, role) {
    state.userRole = role;
  },
  clearUserRole(state) {
    state.userRole = null;
  }
};

export const actions = {
  nuxtServerInit({ commit }, { req }) {
    if (req.headers.cookie) {
      const jwtCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('jwt='));
      const tokenExpirationCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('tokenExpiration='));
      const userIdCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('userId='));
      const userRoleCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('userRole='));

      if (jwtCookie) {
        const token = jwtCookie.split('=')[1];
        const tokenExpiration = tokenExpirationCookie ? parseInt(tokenExpirationCookie.split('=')[1]) : null;
        commit('setToken', { token, tokenExpiration });
      }
      if (userIdCookie) {
        const userId = userIdCookie.split('=')[1];
        commit('setUserId', userId);
      }
      if (userRoleCookie) {
        const role = userRoleCookie.split('=')[1];
        commit('setUserRole', role);
      }
    }
  },
  login({ commit }, { token, tokenExpiration }) {
    commit('setToken', { token, tokenExpiration });
    this.$cookies.set('jwt', token);
    this.$cookies.set('tokenExpiration', tokenExpiration);
  },
  logout({ commit }) {
    commit('clearToken');
    commit('clearUserId');
    commit('clearUserRole');
    this.$cookies.remove('jwt');
    this.$cookies.remove('tokenExpiration');
    this.$cookies.remove('userId');
    this.$cookies.remove('userRole');
  }
};
