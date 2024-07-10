export const state = () => ({
  token: null,
  userId: null,
  userRole: null
});

export const mutations = {
  setToken(state, token) {
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
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
      const userIdCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('userId='));
      const userRoleCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('userRole='));
      if (jwtCookie) {
        const token = jwtCookie.split('=')[1];
        commit('setToken', token);
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
  logout({ commit }) {
    commit('clearToken');
    commit('clearUserId');
    commit('clearUserRole');
    this.$cookies.remove('jwt');
    this.$cookies.remove('userId');
    this.$cookies.remove('userRole');
  }
};
