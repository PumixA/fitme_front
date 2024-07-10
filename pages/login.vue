<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="error">{{ error }}</p>

    <h2>Vous souhaitez participer à la bêta?</h2>
    <form @submit.prevent="requestBetaAccess">
      <div>
        <label for="betaEmail">Email:</label>
        <input type="email" v-model="betaEmail" required>
      </div>
      <button type="submit">Envoyer</button>
    </form>
    <p v-if="betaError">{{ betaError }}</p>
    <p v-if="betaSuccess">{{ betaSuccess }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      betaEmail: '',
      error: '',
      betaError: '',
      betaSuccess: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await this.$axios.post('/users/login', {
          emailOrPseudo: this.email,
          password: this.password
        });
        const { token } = response.data;
        const userRole = this.parseJwt(token).role;
        const userId = this.parseJwt(token).id;

        this.$cookies.set('jwt', token, { path: '/', maxAge: 60 * 60 });
        this.$cookies.set('userId', userId, { path: '/', maxAge: 60 * 60 });
        this.$cookies.set('userRole', userRole, { path: '/', maxAge: 60 * 60 });

        this.$store.commit('setToken', token);
        this.$store.commit('setUserId', userId);
        this.$store.commit('setUserRole', userRole);

        if (userRole === 'admin') {
          this.$router.push('/adminDashboard');
        } else if (userRole === 'utilisateur') {
          this.$router.push('/profile');
        } else if (userRole === 'banni') {
          this.$router.push('/bannissement');
        } else {
          this.error = 'Role not recognized';
        }
      } catch (error) {
        this.error = 'Login failed. Please check your credentials and try again.';
      }
    },
    async requestBetaAccess() {
      try {
        const response = await this.$axios.post('/invitations/demandes_invitation', {
          email: this.betaEmail
        });
        this.betaSuccess = 'Demande envoyée avec succès';
        this.betaError = '';
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.betaError = error.response.data.message;
        } else {
          this.betaError = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    },
    parseJwt(token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: auto;
  padding: 1em;
}
</style>
