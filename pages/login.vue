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
        const token = response.data.token;
        this.$cookies.set('jwt', token, { path: '/', maxAge: 60 * 60 }); // 1 heure
        this.$store.commit('setToken', token);
        this.$router.push('/profile');
      } catch (error) {
        this.error = 'Login failed. Please check your credentials and try again.';
      }
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
