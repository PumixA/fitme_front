<template>
  <div></div>
</template>

<script>
export default {
  middleware: 'auth',
  mounted() {
    if (!this.$store.state.token) {
      this.$router.push('/login');
    }
  }
}
</script>
