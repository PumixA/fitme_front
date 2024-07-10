<template>
  <div class="demandes-tab">
    <h2>Demandes</h2>
    <input type="text" v-model="searchQuery" placeholder="Rechercher" />
    <table>
      <thead>
      <tr>
        <th>Email</th>
        <th>Date de Demande</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="demande in filteredDemandes" :key="demande.id">
        <td>{{ demande.email }}</td>
        <td>{{ formatDate(demande.date_invitation) }}</td>
        <td><button @click="deleteDemande(demande.id)">✔️</button></td>
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
      demandes: []
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
    },
    deleteDemande(id) {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) {
        this.$axios.delete(`/admin/demandes_invitation/${id}`)
          .then(response => {
            this.fetchDemandes();
          })
          .catch(error => {
            console.error('Error deleting demande:', error);
          });
      }
    },
    fetchDemandes() {
      this.$axios.get('/admin/demandes_invitation')
        .then(response => {
          this.demandes = response.data;
        })
        .catch(error => {
          console.error('Error fetching demandes:', error);
        });
    }
  },
  mounted() {
    this.fetchDemandes();
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

button {
  padding: 0.5em 1em;
  cursor: pointer;
  background-color: #1abc9c;
  color: white;
  border: none;
}

button:hover {
  background-color: #16a085;
}
</style>
