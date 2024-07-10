<template>
  <div class="demandes-tab">
    <h2>Demandes</h2>
    <input type="text" v-model="searchQuery" placeholder="Rechercher" />
    <table>
      <thead>
      <tr>
        <th>Email</th>
        <th>Date de Demande</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="demande in filteredDemandes" :key="demande.id">
        <td>{{ demande.email }}</td>
        <td>{{ formatDate(demande.date_invitation) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
      demandes: [] // Initialisez avec les données des demandes
    }
  },
  computed: {
    filteredDemandes() {
      return this.demandes.filter(demande =>
        demande.email.includes(this.searchQuery)
      );
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    }
  },
  mounted() {
    // Fetch data from API
    this.$axios.get('/admin/demandes_invitation')
      .then(response => {
        this.demandes = response.data;
      })
      .catch(error => {
        console.error('Error fetching demandes:', error);
      });
  }
}
</script>

<style scoped>
.demandes-tab {
  /* Styles spécifiques pour le tab Demandes */
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.5em;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
}

input[type="text"] {
  margin-bottom: 1em;
  padding: 0.5em;
  width: 100%;
  box-sizing: border-box;
}
</style>
