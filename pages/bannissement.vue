<template>
  <div class="bannissement">
    <h1>Accès Refusé</h1>
    <p>Vous avez été banni de cette plateforme.</p>
    <p>Si vous pensez que c'est une erreur, veuillez contacter l'administrateur.</p>
  </div>
</template>

<script>
export default {
  name: 'Bannissement'
}
</script>

<style scoped>
.bannissement {
  max-width: 600px;
  margin: auto;
  padding: 2em;
  text-align: center;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  color: #721c24;
}

h1 {
  font-size: 2em;
  margin-bottom: 0.5em;
}

p {
  font-size: 1.2em;
}
</style>
