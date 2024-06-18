<template>
  <header>
    <nav>
      <ul>
        <li v-if="!isAuthenticated"><nuxt-link to="/login">Login</nuxt-link></li>
        <li v-if="!isAuthenticated"><nuxt-link to="/register">Register</nuxt-link></li>
        <li v-if="isAuthenticated"><nuxt-link to="/profile">Profile</nuxt-link></li>
        <li v-if="isAuthenticated"><button @click="logout">Logout</button></li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  computed: {
    isAuthenticated() {
      return !!this.$store.state.token;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
/* Add some basic styling */
header {
  background: #333;
  color: white;
  padding: 1em;
}

nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1em;
}

nav a {
  color: white;
  text-decoration: none;
}

button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
