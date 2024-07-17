<template>
  <div>
    <h2>Exercices Personnalisés</h2>
    <button v-if="seanceStatus.id_status_seance === null && seanceStatus.id_seance === null" @click="openCreateModal" class="btn-primary">Ajouter un exercice</button>
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Rechercher" />
      <select v-model="selectedGroup">
        <option value="">Tous les groupes</option>
        <option v-for="group in uniqueGroups" :key="group" :value="group">{{ group }}</option>
      </select>
    </div>
    <div class="exercice-list">
      <div v-for="exercice in filteredExercices" :key="exercice._id" class="exercice-item" @click="openEditModal(exercice)">
        <img :src="tempImages[exercice._id] || getImageUrl(exercice.photo)" alt="Photo de l'exercice" />
        <div class="exercice-info">
          <h3>{{ exercice.nom }}</h3>
          <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
        </div>
      </div>
    </div>

    <Modal :visible="showEditModal" @close="closeEditModal" title="Modifier l'exercice personnalisé">
      <div v-if="selectedExercice" class="modal-content">
        <img :src="tempImage || getImageUrl(selectedExercice.photo)" alt="Photo de l'exercice" class="exercise-photo" @click="openImageModal('edit')" />
        <div class="form-group">
          <label for="nom">Nom</label>
          <input type="text" v-model="selectedExercice.nom" readonly @dblclick="makeEditable($event)" @blur="saveChanges" />
        </div>
        <div class="form-group">
          <label for="id_groupe_musculaire">Groupe Musculaire</label>
          <select v-model="selectedExercice.id_groupe_musculaire[0]._id" @change="saveChanges">
            <option v-for="groupe in groupesMusculaires" :key="groupe._id" :value="groupe._id">{{ groupe.nom }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea v-model="selectedExercice.description" readonly @dblclick="makeEditable($event)" @blur="saveChanges"></textarea>
        </div>
        <div class="form-group">
          <label for="lien_video">Lien Vidéo</label>
          <input type="text" v-model="selectedExercice.lien_video" readonly @dblclick="makeEditable($event)" @blur="saveChanges" />
        </div>
        <div class="form-group">
          <label for="nombre_series">Nombre de Séries</label>
          <input type="number" v-model="selectedExercice.nombre_series" @input="updateSeries" @blur="saveChanges" min="0" />
        </div>
        <div v-for="(serie, index) in series" :key="index" class="series-group">
          <h3>Série {{ index + 1 }}</h3>
          <div class="form-group">
            <label for="nombre_rep">Nombre de Répétitions</label>
            <input type="number" v-model="serie.nombre_rep" @blur="saveSeriesChanges" min="0" />
          </div>
          <div class="form-group">
            <label for="poids">Poids</label>
            <input type="number" v-model="serie.poids" @blur="saveSeriesChanges" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label for="temps_repos">Temps de Repos (secondes)</label>
          <input type="number" v-model="selectedExercice.temps_repos" readonly @dblclick="makeEditable($event)" @blur="saveChanges" min="0" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeEditModal" class="btn-secondary">Annuler</button>
          <button type="button" @click="deleteExercice" class="btn-danger">Supprimer</button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showCreateModal" @close="closeCreateModal" title="Ajouter un exercice personnalisé">
      <div class="modal-body">
        <form @submit.prevent="createExercice" class="modal-content">
          <div class="form-group">
            <label for="nom">Nom</label>
            <input type="text" v-model="newExercice.nom" required />
          </div>
          <div class="form-group">
            <label for="id_groupe_musculaire">Groupe Musculaire</label>
            <select v-model="newExercice.id_groupe_musculaire" required>
              <option v-for="groupe in groupesMusculaires" :key="groupe._id" :value="groupe._id">{{ groupe.nom }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="newExercice.description" required></textarea>
          </div>
          <div class="form-group">
            <label for="lien_video">Lien Vidéo</label>
            <input type="text" v-model="newExercice.lien_video" />
          </div>
          <div class="form-group">
            <label for="nombre_series">Nombre de Séries</label>
            <input type="number" v-model="newExercice.nombre_series" @input="updateNewSeries" required min="0" />
          </div>
          <div v-for="(serie, index) in newSeries" :key="index" class="series-group">
            <h3>Série {{ index + 1 }}</h3>
            <div class="form-group">
              <label for="nombre_rep">Nombre de Répétitions</label>
              <input type="number" v-model="serie.nombre_rep" min="0" />
            </div>
            <div class="form-group">
              <label for="poids">Poids</label>
              <input type="number" v-model="serie.poids" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label for="temps_repos">Temps de Repos (secondes)</label>
            <input type="number" v-model="newExercice.temps_repos" required min="0" />
          </div>
          <div class="form-group">
            <img :src="tempImage || '/images/exercice.jpg'" alt="Photo de l'exercice" class="exercice-image" @click="openImageModal('create')" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </Modal>

    <Modal :visible="showImageModal" @close="closeImageModal" title="Changer la photo de l'exercice">
      <form @submit.prevent="confirmImageUpload" class="modal-content">
        <input type="file" @change="handleImageUpload" accept="image/png, image/jpeg" />
        <div v-if="imageError" class="error">{{ imageError }}</div>
        <div class="modal-footer">
          <button type="button" @click="closeImageModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';

export default {
  name: 'ExerciceCustom',
  components: {
    Modal
  },
  data() {
    return {
      exercices: [],
      groupesMusculaires: [],
      searchQuery: '',
      selectedGroup: '',
      showEditModal: false,
      showCreateModal: false,
      showImageModal: false,
      selectedExercice: null,
      newExercice: {
        nom: '',
        id_groupe_musculaire: '',
        description: '',
        lien_video: '',
        nombre_series: 1,
        nombre_rep: [10],
        poids: [0],
        temps_repos: 0,
        photo: null
      },
      tempImages: {}, // Object to store temporary images for exercises
      tempImage: null,
      selectedImage: null,
      imageError: '',
      isEditable: false,
      backendUrl: 'http://localhost:4000', // Direct URL to the backend
      imageMode: '', // Track whether we're creating or editing
      series: [],
      newSeries: [{ index: 0, nombre_rep: 10, poids: 0 }],
      seanceStatus: { id_status_seance: null, id_seance: null } // Initial state
    };
  },
  computed: {
    filteredExercices() {
      return this.exercices.filter(exercice => {
        const matchesSearchQuery = exercice.nom.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesGroup = this.selectedGroup ? exercice.id_groupe_musculaire[0].nom === this.selectedGroup : true;
        return matchesSearchQuery && matchesGroup;
      });
    },
    uniqueGroups() {
      const groups = this.exercices.map(exercice => exercice.id_groupe_musculaire[0].nom);
      return [...new Set(groups)];
    }
  },
  methods: {
    fetchExercices() {
      this.$axios.get(`${this.backendUrl}/api/exercice_custom/getall`)
        .then(response => {
          this.exercices = response.data;
        })
        .catch(error => {
          console.error('Error fetching exercices:', error);
        });
    },
    fetchGroupesMusculaires() {
      this.$axios.get(`${this.backendUrl}/api/groupe_musculaire`)
        .then(response => {
          this.groupesMusculaires = response.data;
        })
        .catch(error => {
          console.error('Error fetching groupes musculaires:', error);
        });
    },
    checkSeanceStatus() {
      this.$axios.get(`${this.backendUrl}/api/users/checkseance`)
        .then(response => {
          this.seanceStatus = response.data;
        })
        .catch(error => {
          console.error('Error checking seance status:', error);
        });
    },
    getImageUrl(photo) {
      return photo ? `${this.backendUrl}/uploads/exercice_custom/${photo}` : '/images/exercice.jpg';
    },
    openEditModal(exercice) {
      if (this.seanceStatus.id_status_seance !== null || this.seanceStatus.id_seance !== null) {
        return;
      }
      this.$axios.get(`${this.backendUrl}/api/exercice_custom/getone/${exercice._id}`)
        .then(response => {
          this.selectedExercice = response.data;
          this.tempImage = null; // Reset tempImage when editing a new exercise
          this.updateSeries(); // Initialize series based on nombre_series
          this.showEditModal = true;
          this.isEditable = false;
        })
        .catch(error => {
          console.error('Error fetching exercice details:', error);
        });
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedExercice = null;
      this.tempImage = null;
      this.imageError = '';
    },
    openCreateModal() {
      this.showCreateModal = true;
      this.updateNewSeries(); // Initialize series based on nombre_series
    },
    closeCreateModal() {
      this.showCreateModal = false;
      this.newExercice = {
        nom: '',
        id_groupe_musculaire: '',
        description: '',
        lien_video: '',
        nombre_series: 1,
        nombre_rep: [10],
        poids: [0],
        temps_repos: 0,
        photo: null
      };
      this.newSeries = [{ index: 0, nombre_rep: 10, poids: 0 }];
      this.tempImage = null;
      this.imageError = '';
    },
    createExercice() {
      const formData = new FormData();
      formData.append('nom', this.newExercice.nom);
      formData.append('id_groupe_musculaire', this.newExercice.id_groupe_musculaire);
      formData.append('description', this.newExercice.description);
      formData.append('lien_video', this.newExercice.lien_video);
      formData.append('nombre_series', this.newExercice.nombre_series);
      formData.append('nombre_rep', JSON.stringify(this.newSeries.map(serie => serie.nombre_rep)));
      formData.append('poids', JSON.stringify(this.newSeries.map(serie => serie.poids)));
      formData.append('temps_repos', this.newExercice.temps_repos);
      if (this.newExercice.photo) {
        formData.append('photo', this.newExercice.photo);
      }

      this.$axios.post(`${this.backendUrl}/api/exercice_custom/add`, formData)
        .then(() => {
          this.closeCreateModal();
          this.fetchExercices();
        })
        .catch(error => {
          console.error('Error creating exercice:', error);
        });
    },
    saveChanges() {
      const formData = new FormData();
      formData.append('nom', this.selectedExercice.nom);
      formData.append('id_groupe_musculaire', this.selectedExercice.id_groupe_musculaire[0]._id);
      formData.append('description', this.selectedExercice.description);
      formData.append('lien_video', this.selectedExercice.lien_video);
      formData.append('nombre_series', this.selectedExercice.nombre_series);
      formData.append('nombre_rep', JSON.stringify(this.series.map(serie => serie.nombre_rep)));
      formData.append('poids', JSON.stringify(this.series.map(serie => serie.poids)));
      formData.append('temps_repos', this.selectedExercice.temps_repos);
      if (this.selectedExercice.photo) {
        formData.append('photo', this.selectedExercice.photo);
      }

      this.$axios.put(`${this.backendUrl}/api/exercice_custom/edit/${this.selectedExercice._id}`, formData)
        .then(() => {
          this.tempImages[this.selectedExercice._id] = this.tempImage; // Update the tempImage in the list
          this.fetchExercices();
        })
        .catch(error => {
          console.error('Error saving changes:', error);
        });
    },
    saveSeriesChanges() {
      this.selectedExercice.nombre_rep = this.series.map(serie => serie.nombre_rep);
      this.selectedExercice.poids = this.series.map(serie => serie.poids);
      this.saveChanges();
    },
    deleteExercice() {
      this.$axios.put(`${this.backendUrl}/api/exercice_custom/delete/${this.selectedExercice._id}`)
        .then(() => {
          this.closeEditModal();
          this.fetchExercices();
        })
        .catch(error => {
          console.error('Error deleting exercice:', error);
        });
    },
    openImageModal(mode) {
      this.imageMode = mode;
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
      this.selectedImage = null;
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
          this.tempImages[this.selectedExercice._id] = this.tempImage; // Update the tempImage in the list
        }
        this.showImageModal = false; // Only close the image modal, keep the main modal open
      } else {
        this.imageError = 'Veuillez sélectionner une image.';
      }
    },
    updateSeries() {
      this.series = Array.from({ length: this.selectedExercice.nombre_series }, (_, index) => ({
        index,
        nombre_rep: this.selectedExercice.nombre_rep[index] || 0,
        poids: this.selectedExercice.poids[index] || 0
      }));
    },
    updateNewSeries() {
      this.newSeries = Array.from({ length: this.newExercice.nombre_series }, (_, index) => ({
        index,
        nombre_rep: this.newExercice.nombre_rep[index] || 0,
        poids: this.newExercice.poids[index] || 0
      }));
    }
  },
  mounted() {
    this.fetchExercices();
    this.fetchGroupesMusculaires();
    this.checkSeanceStatus(); // Check seance status on mount
  }
};
</script>

<style scoped>
.search-filter {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}

input[type="text"] {
  flex: 1;
  padding: 0.5em;
}

select {
  padding: 0.5em;
}

.exercice-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.exercice-item {
  display: flex;
  align-items: center;
  padding: 1em;
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  cursor: pointer;
}

.exercice-item:hover {
  background-color: #e0e0e0;
}

.exercice-item img {
  width: 50px;
  height: 50px;
  margin-right: 1em;
}

.exercice-info {
  display: flex;
  flex-direction: column;
}

.exercice-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  cursor: pointer;
}

button {
  background-color: #1abc9c;
  color: white;
  padding: 0.5em 1em;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #16a085;
}

.exercise-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 1em;
}

.form-group {
  margin-bottom: 1em;
}

.series-group {
  margin-bottom: 1em;
}

.btn-primary {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
}

.btn-secondary {
  background-color: #ccc;
  color: #333;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
