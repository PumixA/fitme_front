<template>
  <div>
    <h1>Admin Profile Page</h1>
    <p v-if="user">Welcome, Admin {{ user.pseudo }} ({{ user.email }})</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  data() {
    return {
      user: null,
    }
  },
  async fetch() {
    try {
      const response = await this.$axios.get('/users/adminProfile');
      this.user = response.data;
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  },
  middleware: 'auth'
}
</script>

<style scoped>
/* Add some basic styling */
</style>
