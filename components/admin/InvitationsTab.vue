<template>
  <div class="invitations-tab">
    <h2>Invitations</h2>
    <button @click="showModal = true">Créer une Invitation</button>
    <input type="text" v-model="searchQuery" placeholder="Rechercher" />
    <table>
      <thead>
      <tr>
        <th>Email</th>
        <th>Nbr Utilisations</th>
        <th>Limite Utilisation</th>
        <th>Date d'utilisation</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="invitation in filteredInvitations" :key="invitation.id">
        <td>{{ invitation.email || 'N/A' }}</td>
        <td>{{ invitation.nombre_utilisation }}</td>
        <td>{{ invitation.limite_utilisation }}</td>
        <td>{{ formatDate(invitation.date_utilisation) }}</td>
      </tr>
      </tbody>
    </table>
    <Modal :visible="showModal" @close="showModal = false" title="Créer une Invitation">
      <form @submit.prevent="createInvitation">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="newInvitation.email" required />
        </div>
        <div>
          <label for="limite_utilisation">Limite d'utilisation:</label>
          <input type="number" v-model="newInvitation.limite_utilisation" required />
        </div>
        <button type="submit">Créer</button>
        <button type="button" @click="showModal = false">Annuler</button>
      </form>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue'

export default {
  components: {
    Modal
  },
  data() {
    return {
      searchQuery: '',
      invitations: [],
      showModal: false,
      newInvitation: {
        email: '',
        limite_utilisation: 1
      }
    }
  },
  computed: {
    filteredInvitations() {
      return this.invitations.filter(invitation =>
        (invitation.email || '').includes(this.searchQuery)
      );
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    createInvitation() {
      this.$axios.post('/admin/users/inviter', this.newInvitation)
        .then(response => {
          this.invitations.push(response.data);
          this.showModal = false;
          this.newInvitation.email = '';
          this.newInvitation.limite_utilisation = 1;
        })
        .catch(error => {
          console.error('Error creating invitation:', error);
        });
    }
  },
  mounted() {
    // Fetch data from API
    this.$axios.get('/admin/users/inviter/getall')
      .then(response => {
        this.invitations = response.data;
      })
      .catch(error => {
        console.error('Error fetching invitations:', error);
      });
  }
}
</script>

<style scoped>
.invitations-tab {
  /* Styles spécifiques pour le tab Invitations */
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

input[type="text"], input[type="email"], input[type="number"] {
  margin-bottom: 1em;
  padding: 0.5em;
  width: 100%;
  box-sizing: border-box;
}

button {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
}

button:hover {
  background-color: #16a085;
}
</style>
