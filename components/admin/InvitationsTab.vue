<template>
  <div class="invitations-tab">
    <h2>Invitations</h2>
    <button @click="openCreateInvitationModal" class="btn-primary">Créer une Invitation</button>
    <input type="text" v-model="searchQuery" placeholder="Rechercher" />
    <table>
      <thead>
      <tr>
        <th>Email</th>
        <th>Nbr Utilisations</th>
        <th>Limite Utilisation</th>
        <th>Date d'utilisation</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="invitation in filteredInvitations" :key="invitation.id">
        <td>{{ invitation.email || 'N/A' }}</td>
        <td>{{ invitation.nombre_utilisation }}</td>
        <td>{{ invitation.limite_utilisation }}</td>
        <td>{{ invitation.date_utilisation ? formatDate(invitation.date_utilisation) : 'Non utilisé' }}</td>
        <td><button @click="showRegistrationLink(invitation.id)">...</button></td>
      </tr>
      </tbody>
    </table>

    <!-- Modal for creating invitation -->
    <Modal :visible="showCreateModal" @close="closeCreateModal" title="Créer une Invitation">
      <form @submit.prevent="createInvitation">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" v-model="newInvitation.email" />
        </div>
        <div class="form-group">
          <label for="limite_utilisation">Limite d'utilisation</label>
          <input type="number" v-model="newInvitation.limite_utilisation" required />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Créer</button>
        </div>
      </form>
    </Modal>

    <!-- Modal for displaying registration link and QR code -->
    <Modal :visible="showLinkModal" @close="closeLinkModal" title="Lien d'invitation">
      <div v-if="registrationLink">
        <p>{{ registrationLink }}</p>
        <div ref="qrcode"></div>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue'
import qrcode from 'qrcode-generator'

export default {
  components: {
    Modal
  },
  data() {
    return {
      searchQuery: '',
      invitations: [],
      showCreateModal: false,
      showLinkModal: false,
      newInvitation: {
        email: '',
        limite_utilisation: 1
      },
      registrationLink: ''
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
          this.closeCreateModal();
          this.newInvitation.email = '';
          this.newInvitation.limite_utilisation = 1;
          this.fetchInvitations(); // Update the invitations table
        })
        .catch(error => {
          console.error('Error creating invitation:', error);
        });
    },
    fetchInvitations() {
      this.$axios.get('/admin/users/inviter/getall')
        .then(response => {
          this.invitations = response.data;
        })
        .catch(error => {
          console.error('Error fetching invitations:', error);
        });
    },
    showRegistrationLink(id) {
      this.$axios.get(`/admin/users/inviter/getone/${id}`)
        .then(response => {
          this.registrationLink = response.data.registrationLink;
          this.showLinkModal = true;
          this.$nextTick(() => {
            this.generateQRCode(this.registrationLink);
          });
        })
        .catch(error => {
          console.error('Error fetching registration link:', error);
        });
    },
    openCreateInvitationModal() {
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
    closeLinkModal() {
      this.showLinkModal = false;
      this.registrationLink = '';
      this.clearQRCode();
    },
    generateQRCode(text) {
      const qr = qrcode(0, 'L');
      qr.addData(text);
      qr.make();
      this.$refs.qrcode.innerHTML = qr.createImgTag(6);
    },
    clearQRCode() {
      if (this.$refs.qrcode) {
        this.$refs.qrcode.innerHTML = '';
      }
    }
  },
  mounted() {
    this.fetchInvitations();
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
  padding: 0.5em 1em;
  cursor: pointer;
}

button:hover {
  opacity: 0.8;
}

.btn-primary {
  background-color: #1abc9c;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #ccc;
  color: #333;
  border: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
