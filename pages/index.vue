<template>
  <div />
</template>

<script>
export default {
  middleware: 'auth',
  mounted () {
    const userRole = this.$store.state.userRole;

    if (!this.$store.state.token) {
      this.$router.push('/login');
    } else if (userRole === 'admin') {
      this.$router.push('/admin/adminDashboard');
    } else if (userRole === 'utilisateur') {
      this.$router.push('/utilisateur/dashboard');
    } else {
      this.$router.push('/login');
    }
  }
}
</script>
