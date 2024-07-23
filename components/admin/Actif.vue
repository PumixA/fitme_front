<template>
  <div class="actif-tab">
    <h2>Utilisateurs Actifs</h2>
    <input type="text" v-model="searchQuery" placeholder="Rechercher" />
    <table>
      <thead>
      <tr>
        <th>Email</th>
        <th>Dernière connexion</th>
        <th>Actions</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in filteredUsers" :key="user.id" @click="showUserDetails(user.id)" class="table-row">
        <td>{{ user.email }}</td>
        <td>{{ user.date_modification ? formatDate(user.date_modification) : 'Aucune connexion' }}</td>
        <td>
          <button @click.stop="banUser(user.id)">Bannir</button>
        </td>
      </tr>
      </tbody>
    </table>

    <Modal :visible="showUserModal" @close="closeUserModal" title="Informations sur l'utilisateur">
      <div v-if="selectedUser">
        <img :src="getUserProfileImage(selectedUser)" alt="Photo de profil" class="profile-image" />
        <p>Email : {{ selectedUser.email }}</p>
        <p>Nom : {{ selectedUser.nom }}</p>
        <p>Prénom : {{ selectedUser.prenom }}</p>
        <p>Age : {{ selectedUser.age }}</p>
        <p>Genre : {{ selectedUser.genre }}</p>
        <p>Date d'inscription : {{ formatDate(selectedUser.date_inscription) }}</p>
      </div>
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
      users: [],
      showUserModal: false,
      selectedUser: null,
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user =>
        user.email.includes(this.searchQuery)
      );
    }
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    banUser(id) {
      if (confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) {
        this.$axios.put(`/admin/users/ban/${id}`)
          .then(response => {
            this.fetchUsers();
          })
          .catch(error => {
            console.error('Error banning user:', error);
          });
      }
    },
    fetchUsers() {
      this.$axios.get(`/admin/users/actif`)
        .then(response => {
          this.users = response.data;
        })
        .catch(error => {
          console.error('Error fetching users:', error);
        });
    },
    showUserDetails(id) {
      this.$axios.get(`/admin/users/getone/${id}`)
        .then(response => {
          this.selectedUser = response.data;
          this.showUserModal = true;
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
        });
    },
    getUserProfileImage(user) {
      if (user.photo_profil) {
        return `${process.env.VUE_APP_API_URL}/uploads/users/${user.photo_profil}`;
      }
      return '/images/photodeprofil.png'; // Path to the default profile image
    },
    closeUserModal() {
      this.showUserModal = false;
      this.selectedUser = null;
    }
  },
  mounted() {
    this.fetchUsers();
  }
}
</script>

<style scoped>
.actif-tab {
  /* Styles spécifiques pour le tab Actifs */
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

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.table-row:hover {
  background-color: #f0f0f0;
  cursor: pointer;
}
</style>
