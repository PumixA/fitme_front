<template>
  <div>
    <h1>Profile Page</h1>
    <p v-if="user">Welcome, {{ user.pseudo }} ({{ user.email }})</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
    }
  },
  async fetch() {
    try {
      const response = await this.$axios.get('/users/profile');
      this.user = response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },
  middleware: 'auth'
}
</script>

<style scoped>
/* Add some basic styling */
</style>
