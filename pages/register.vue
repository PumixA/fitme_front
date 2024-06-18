<template>
  <div class="register">
    <h1>Register</h1>
    <form @submit.prevent="register">
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
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pseudo: '',
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async register() {
      try {
        await this.$axios.post('/users/register', {
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
/* Add some basic styling */
.register {
  max-width: 400px;
  margin: auto;
  padding: 1em;
}
</style>
