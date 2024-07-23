<template>
  <div class="exercices-tab">
    <h2>Exercices</h2>
    <button @click="openCreateModal" class="btn-primary">Ajouter un exercice</button>
    <input type="text" v-model="searchQuery" placeholder="Rechercher" />
    <table>
      <thead>
      <tr>
        <th>Nom</th>
        <th>Groupe Musculaire</th>
        <th>Date Modification</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="exercice in filteredExercices" :key="exercice._id" @click="openEditModal(exercice)">
        <td>{{ exercice.nom }}</td>
        <td>{{ exercice.id_groupe_musculaire[0].nom }}</td>
        <td>{{ formatDate(exercice.date_modification) }}</td>
      </tr>
      </tbody>
    </table>

    <!-- Modal pour ajouter un exercice -->
    <Modal :visible="showCreateModal" @close="closeCreateModal" title="Ajouter un exercice">
      <div class="modal-body">
        <form @submit.prevent="createExercice">
          <div class="form-group">
            <label for="nom">Nom de l'exercice</label>
            <input type="text" v-model="newExercice.nom" required />
          </div>
          <div class="form-group">
            <label for="id_groupe_musculaire">Groupe musculaire</label>
            <select v-model="newExercice.id_groupe_musculaire" required>
              <option v-for="group in groupeMusculaires" :value="group._id">{{ group.nom }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="newExercice.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="lien_video">Lien vidéo explicative</label>
            <input type="text" v-model="newExercice.lien_video" required />
          </div>
          <div class="form-group">
            <img :src="getExerciceImage(newExercice)" alt="Photo de l'exercice" class="exercice-image" @click="openImageModal('create')" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Modal pour éditer un exercice -->
    <Modal :visible="showEditModal" @close="closeEditModal" title="Modifier l'exercice">
      <div class="modal-body" v-if="selectedExercice">
        <img :src="getExerciceImage(selectedExercice)" alt="Photo de l'exercice" class="exercice-image" @click="openImageModal('edit')" />
        <form @submit.prevent="editExercice">
          <div class="form-group">
            <label for="nom">Nom de l'exercice</label>
            <input type="text" v-model="selectedExercice.nom" @dblclick="makeEditable" :readonly="!isEditable" required />
          </div>
          <div class="form-group">
            <label for="id_groupe_musculaire">Groupe musculaire</label>
            <select v-model="selectedExercice.id_groupe_musculaire[0]._id" required>
              <option v-for="group in groupeMusculaires" :value="group._id">{{ group.nom }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="selectedExercice.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="lien_video">Lien vidéo explicative</label>
            <input type="text" v-model="selectedExercice.lien_video" required />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeEditModal" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </Modal>

    <!-- Modal pour changer l'image -->
    <Modal :visible="showImageModal" @close="closeImageModal" title="Changer la photo de l'exercice">
      <input type="file" @change="handleImageUpload" accept="image/png, image/jpeg" />
      <div v-if="imageError" class="error">{{ imageError }}</div>
      <div class="modal-footer">
        <button type="button" @click="closeImageModal" class="btn-secondary">Annuler</button>
        <button type="button" @click="confirmImageUpload" class="btn-primary">Enregistrer</button>
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
      searchQuery: '',
      exercices: [],
      groupeMusculaires: [],
      showCreateModal: false,
      showEditModal: false,
      showImageModal: false,
      newExercice: {
        nom: '',
        description: '',
        id_groupe_musculaire: '',
        lien_video: '',
        photo: null
      },
      selectedExercice: null,
      selectedImage: null,
      tempImage: null,
      imageError: '',
      isEditable: false,
      imageMode: '' // Track whether we're creating or editing
    };
  },
  computed: {
    filteredExercices() {
      return this.exercices.filter(exercice =>
        exercice.nom.includes(this.searchQuery)
      );
    }
  },
  methods: {
    fetchExercices() {
      this.$axios.get(`/admin/exercice`)
        .then(response => {
          this.exercices = response.data;
        })
        .catch(error => {
          console.error('Error fetching exercises:', error);
        });
    },
    fetchGroupeMusculaires() {
      this.$axios.get(`/admin/groupe_musculaire`)
        .then(response => {
          this.groupeMusculaires = response.data;
        })
        .catch(error => {
          console.error('Error fetching muscle groups:', error);
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
      this.newExercice = {
        nom: '',
        description: '',
        id_groupe_musculaire: '',
        lien_video: '',
        photo: null
      };
      this.tempImage = null;
      this.imageError = '';
    },
    createExercice() {
      const formData = new FormData();
      formData.append('nom', this.newExercice.nom);
      formData.append('description', this.newExercice.description);
      formData.append('id_groupe_musculaire', this.newExercice.id_groupe_musculaire);
      formData.append('lien_video', this.newExercice.lien_video);
      if (this.newExercice.photo) {
        formData.append('photo', this.newExercice.photo);
      }

      this.$axios.post(`/admin/exercice/add`, formData)
        .then(() => {
          this.closeCreateModal();
          this.fetchExercices();
        })
        .catch(error => {
          console.error('Error adding exercise:', error);
        });
    },
    openEditModal(exercice) {
      this.$axios.get(`/admin/exercice/getone/${exercice._id}`)
        .then(response => {
          this.selectedExercice = response.data;
          this.showEditModal = true;
          this.isEditable = false;
        })
        .catch(error => {
          console.error('Error fetching exercise details:', error);
        });
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedExercice = null;
      this.tempImage = null;
      this.imageError = '';
    },
    editExercice() {
      const formData = new FormData();
      formData.append('nom', this.selectedExercice.nom);
      formData.append('description', this.selectedExercice.description);
      formData.append('id_groupe_musculaire', this.selectedExercice.id_groupe_musculaire[0]._id);
      formData.append('lien_video', this.selectedExercice.lien_video);
      if (this.selectedExercice.photo) {
        formData.append('photo', this.selectedExercice.photo);
      }

      this.$axios.put(`/admin/exercice/edit/${this.selectedExercice._id}`, formData)
        .then(() => {
          this.closeEditModal();
          this.fetchExercices();
        })
        .catch(error => {
          console.error('Error editing exercise:', error);
        });
    },
    openImageModal(mode) {
      this.imageMode = mode;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.selectedImage = null;
      this.tempImage = null;
      this.imageError = '';
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
        this.imageError = 'Seuls les fichiers PNG et JPG sont autorisés.';
        return;
      }
      this.selectedImage = file;
      this.imageError = '';
      const reader = new FileReader();
      reader.onload = (e) => {
        this.tempImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    confirmImageUpload() {
      if (this.selectedImage) {
        if (this.imageMode === 'create') {
          this.newExercice.photo = this.selectedImage;
        } else if (this.imageMode === 'edit') {
          this.selectedExercice.photo = this.selectedImage;
        }
        this.closeImageModal();
      }
    },
    getExerciceImage(exercice) {
      if (this.tempImage) {
        return this.tempImage;
      }
      if (exercice.photo) {
        return `${process.env.VUE_APP_API_URL}/uploads/exercices/${exercice.photo}`;
      }
      return '/images/exercice.jpg'; // Path to the default exercise image
    },
    makeEditable() {
      this.isEditable = true;
    }
  },
  mounted() {
    this.fetchExercices();
    this.fetchGroupeMusculaires();
  }
};
</script>

<style scoped>
.exercices-tab {
  /* Styles spécifiques pour le tab Exercices */
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

.exercice-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1em;
}

textarea {
  width: 100%;
  height: 100px;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-body {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
