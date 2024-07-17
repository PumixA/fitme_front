<template>
  <div class="not-found">
    <h1>Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <nuxt-link to="/">Go back to Home</nuxt-link>
  </div>
</template>

<script>
export default {
  layout: 'erreur'
}
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}

.not-found h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

.not-found p {
  margin-bottom: 20px;
}

.not-found a {
  color: #1abc9c;
  text-decoration: underline;
}
</style>
