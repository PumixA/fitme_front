<template>
  <div class="groupe-musculaire-tab">
    <h1>Groupes Musculaires</h1>
    <button @click="openCreateModal" class="btn-primary">Ajouter un groupe musculaire</button>
    <table>
      <thead>
      <tr>
        <th>Nom</th>
        <th>Date Modification</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="groupe in groupesMusculaires" :key="groupe._id" @click="openEditModal(groupe)">
        <td>{{ groupe.nom }}</td>
        <td>{{ formatDate(groupe.date_modification) }}</td>
      </tr>
      </tbody>
    </table>

    <!-- Modal pour ajouter un groupe musculaire -->
    <Modal :visible="showCreateModal" @close="closeCreateModal" title="Ajouter un groupe musculaire">
      <form @submit.prevent="createGroupeMusculaire">
        <div class="form-group">
          <label for="nom">Nom</label>
          <input type="text" v-model="newGroupe.nom" required />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </Modal>

    <!-- Modal pour éditer un groupe musculaire -->
    <Modal :visible="showEditModal" @close="closeEditModal" title="Éditer un groupe musculaire">
      <div v-if="selectedGroupe">
        <form @submit.prevent="editGroupeMusculaire">
          <div class="form-group">
            <label for="nom">Nom</label>
            <input type="text" v-model="selectedGroupe.nom" @dblclick="makeEditable" :readonly="!isEditable" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeEditModal" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';

export default {
  layout: 'admin',
  middleware: 'auth',
  components: {
    Modal
  },
  data() {
    return {
      groupesMusculaires: [],
      showCreateModal: false,
      showEditModal: false,
      newGroupe: {
        nom: ''
      },
      selectedGroupe: null,
      isEditable: false,
      backendUrl: 'http://localhost:4000' // Direct URL to the backend
    };
  },
  methods: {
    fetchGroupesMusculaires() {
      this.$axios.get(`${this.backendUrl}/api/admin/groupe_musculaire`)
        .then(response => {
          this.groupesMusculaires = response.data;
        })
        .catch(error => {
          console.error('Error fetching groupes musculaires:', error);
        });
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    openCreateModal() {
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
      this.newGroupe.nom = '';
    },
    createGroupeMusculaire() {
      this.$axios.post(`${this.backendUrl}/api/admin/groupe_musculaire/add`, this.newGroupe)
        .then(() => {
          this.closeCreateModal();
          this.fetchGroupesMusculaires();
        })
        .catch(error => {
          console.error('Error creating groupe musculaire:', error);
        });
    },
    openEditModal(groupe) {
      this.$axios.get(`${this.backendUrl}/api/admin/groupe_musculaire/getone/${groupe._id}`)
        .then(response => {
          this.selectedGroupe = response.data;
          this.showEditModal = true;
          this.isEditable = false;
        })
        .catch(error => {
          console.error('Error fetching groupe musculaire details:', error);
        });
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedGroupe = null;
    },
    editGroupeMusculaire() {
      if (this.selectedGroupe) {
        this.$axios.put(`${this.backendUrl}/api/admin/groupe_musculaire/edit/${this.selectedGroupe._id}`, { nom: this.selectedGroupe.nom })
          .then(() => {
            this.closeEditModal();
            this.fetchGroupesMusculaires();
          })
          .catch(error => {
            console.error('Error editing groupe musculaire:', error);
          });
      }
    },
    makeEditable() {
      this.isEditable = true;
    }
  },
  mounted() {
    this.fetchGroupesMusculaires();
  }
};
</script>

<style scoped>
.groupe-musculaire-tab {
  /* Styles spécifiques pour le tab Groupes Musculaires */
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

td {
  cursor: pointer;
}

tr:hover {
  background-color: #f0f0f0;
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
