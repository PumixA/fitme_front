<template>
  <div class="bannissement">
    <h1>Accès Refusé</h1>
    <p>Vous avez été banni de cette plateforme.</p>
    <p>Si vous pensez que c'est une erreur, veuillez contacter l'administrateur.</p>
    <button @click="logout">Déconnexion</button>
  </div>
</template>

<script>
export default {
  layout: 'erreur',
  name: 'Bannissement',
  methods: {
    logout () {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  }
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

button {
  margin-top: 1em;
  padding: 0.5em 1em;
  font-size: 1em;
  color: white;
  background-color: #721c24;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #501517;
}
</style>
