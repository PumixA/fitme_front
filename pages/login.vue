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
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await this.$axios.post('/users/login', {
          email: this.email,
          password: this.password
        });
        const { token } = response.data;
        const userRole = this.parseJwt(token).role; // Extraire le rôle du JWT
        this.$cookies.set('jwt', token, { path: '/', maxAge: 60 * 60 }); // 1 heure
        this.$cookies.set('userRole', userRole, { path: '/', maxAge: 60 * 60 }); // 1 heure
        this.$store.commit('setToken', token);
        this.$store.commit('setUserRole', userRole);
        if (userRole === 'admin') {
          this.$router.push('/adminProfile');
        } else if (userRole === 'utilisateur') {
          this.$router.push('/profile');
        } else {
          this.error = 'Role not recognized';
        }
      } catch (error) {
        this.error = 'Login failed. Please check your credentials and try again.';
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
/* Add some basic styling */
.login {
  max-width: 400px;
  margin: auto;
  padding: 1em;
}
</style>
