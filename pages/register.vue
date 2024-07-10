<template>
  <div class="register">
    <h1>Register</h1>
    <form v-if="isTokenValid" @submit.prevent="register">
      <div>
        <label for="pseudo">Pseudo:</label>
        <input type="text" v-model="pseudo" required>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" v-model="email" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" required>
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-else>Invalid token. Redirecting to login...</p>
    <p v-if="error">{{ error }}</p>
    <p v-if="isTokenValid">
      Déjà un compte? <nuxt-link to="/login">Se connecter</nuxt-link>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pseudo: '',
      email: '',
      password: '',
      error: '',
      isTokenValid: false
    }
  },
  async created() {
    const token = this.$route.params.token;
    if (!token) {
      this.$router.push('/login');
      return;
    }

    try {
      await this.$axios.get(`/users/register/verifytoken/${token}`);
      this.isTokenValid = true;
    } catch (error) {
      this.$router.push('/login');
    }
  },
  methods: {
    async register() {
      const token = this.$route.params.token;
      try {
        await this.$axios.post(`/users/register/${token}`, {
          pseudo: this.pseudo,
          email: this.email,
          password: this.password
        });
        this.$router.push('/login');
      } catch (error) {
        this.error = 'Registration failed. Please try again.';
      }
    }
  }
}
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: auto;
  padding: 1em;
}
</style>
