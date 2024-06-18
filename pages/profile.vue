<template>
  <div>
    <h1>Profile Page</h1>
    <p>This is a protected page.</p>
  </div>
</template>

<script>
export default {
  middleware: 'auth'
}
</script>

<style scoped>
/* Add some basic styling */
</style>
