<template>
  <div>
    <div class="exercice-container">
      <div class="search-filter">
        <input v-model="searchQuery" placeholder="Rechercher" />
        <select v-model="selectedGroup">
          <option value="">Tous les groupes</option>
          <option v-for="group in uniqueGroups" :key="group" :value="group">{{ group }}</option>
        </select>
        <button v-if="seanceStatus.id_status_seance === null && seanceStatus.id_seance === null" @click="openCreateModal" class="boutonAjoutExercice">+</button>
      </div>
      <div class="exercice-list">
        <div v-for="exercice in filteredExercices" :key="exercice._id" class="exercice-item" @click="openEditModal(exercice)">
          <div class="exercice-info">
            <img :src="tempImages[exercice._id] || getImageUrl(exercice.photo)" alt="Photo de l'exercice" />
            <h3>{{ exercice.nom }}</h3>
          </div>
          <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
        </div>
      </div>
    </div>

    <Modal :visible="showEditModal" @close="closeEditModal">
      <div v-if="selectedExercice" class="modal-contenu">
        <div class="exercise-header">
          <img :src="tempImage || getImageUrl(selectedExercice.photo)" alt="Photo de l'exercice" class="exercise-image" @click="openImageModal('edit')" />
          <div class="exercise-headerRight">
            <div class="form-group">
              <input class="formTitle" type="text" v-model="selectedExercice.nom" readonly @dblclick="makeEditable($event)" @blur="saveChanges" />
            </div>
            <div class="form-group">
              <select v-model="selectedExercice.id_groupe_musculaire[0]._id" @change="saveChanges">
                <option v-for="groupe in groupesMusculaires" :key="groupe._id" :value="groupe._id">{{ groupe.nom }}</option>
              </select>
            </div>
          </div>
        </div>
       <div class="exercise-body">
         <div class="form-group">
           <label for="description">Description</label>
           <textarea v-model="selectedExercice.description" readonly @dblclick="makeEditable($event)" @blur="saveChanges"></textarea>
         </div>
         <div class="form-group">
           <label for="lien_video">Lien Vidéo</label>
           <input type="text" v-model="selectedExercice.lien_video" readonly @dblclick="makeEditable($event)" @blur="saveChanges" />
         </div>
       </div>
        <div class="exercise-footer">
          <div class="form-group form-group-series">
            <label for="nombre_series">Nombre de Séries</label>
            <input type="number" v-model="selectedExercice.nombre_series" @input="updateSeries" @blur="saveChanges" min="0" />
          </div>
          <div v-for="(serie, index) in series" :key="index" class="series-group exercise-series">
            <h5>Série {{ index + 1 }}</h5>
            <div class="series-form">
              <div class="form-group">
                <label for="nombre_rep" class="mini-label">Nombre de Répétitions</label>
                <input type="number" v-model="serie.nombre_rep" @blur="saveSeriesChanges" min="0" />
              </div>
              <div class="form-group">
                <label for="poids" class="mini-label">Poids</label>
                <input type="number" v-model="serie.poids" @blur="saveSeriesChanges" min="0" />
              </div>
            </div>
          </div>
          <div class="form-group form-group-series">
            <label for="temps_repos">Temps de Repos (secondes)</label>
            <input type="number" v-model="selectedExercice.temps_repos" readonly @dblclick="makeEditable($event)" @blur="saveChanges" min="0" />
          </div>
        </div>
        <button type="button" @click="deleteExercice" class="boutonSupprimer"><fa :icon="['fas', 'trash']" /></button>
      </div>
    </Modal>

    <Modal :visible="showCreateModal" @close="closeCreateModal">
      <div class="modal-body">
        <form @submit.prevent="createExercice" class="modal-contenu">
          <div class="exercise-header">
            <img :src="tempImage || '/images/exercice.jpg'" alt="Photo de l'exercice" class="exercice-image" @click="openImageModal('create')" />
            <div class="exercise-headerRight">
              <div class="form-group">
                <input class="formTitle" placeholder="Nom de l'exercice" type="text" v-model="newExercice.nom" required />
              </div>
              <div class="form-group">
                <select v-model="newExercice.id_groupe_musculaire" required>
                  <option value="" disabled selected>Groupe Musculaire</option>
                  <option v-for="groupe in groupesMusculaires" :key="groupe._id" :value="groupe._id">{{ groupe.nom }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="exercise-body">
            <div class="form-group">
              <label for="description">Description</label>
              <textarea v-model="newExercice.description" required></textarea>
            </div>
            <div class="form-group">
              <label for="lien_video">Lien Vidéo</label>
              <input type="text" v-model="newExercice.lien_video" />
            </div>
          </div>
          <div class="exercise-footer">
            <div class="form-group form-group-series">
              <label for="nombre_series">Nombre de Séries</label>
              <input type="number" v-model="newExercice.nombre_series" @input="updateNewSeries" required min="0" />
            </div>
            <div v-for="(serie, index) in newSeries" :key="index" class="series-group exercise-series">
              <h5>Série {{ index + 1 }}</h5>
              <div class="series-form">
                <div class="form-group">
                  <label for="nombre_rep" class="mini-label">Nombre de Répétitions</label>
                  <input type="number" v-model="serie.nombre_rep" min="0" />
                </div>
                <div class="form-group">
                  <label for="poids" class="mini-label">Poids</label>
                  <input type="number" v-model="serie.poids" min="0" />
                </div>
              </div>
            </div>
            <div class="form-group form-group-series">
              <label for="temps_repos">Temps de Repos (secondes)</label>
              <input type="number" v-model="newExercice.temps_repos" required min="0" />
            </div>
          </div>
          <div class="exercise-buttons">
            <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </Modal>

    <Modal :visible="showImageModal" @close="closeImageModal">
      <form @submit.prevent="confirmImageUpload" class="modal-conu">
        <input type="file" @change="handleImageUpload" accept="image/png, image/jpeg" />
        <div v-if="imageError" class="error">{{ imageError }}</div>
        <div class="exercise-buttons">
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
      this.$axios.get(`/exercice_custom/getall`)
        .then(response => {
          this.exercices = response.data;
        })
        .catch(error => {
          console.error('Error fetching exercices:', error);
        });
    },
    fetchGroupesMusculaires() {
      this.$axios.get(`/groupe_musculaire`)
        .then(response => {
          this.groupesMusculaires = response.data;
        })
        .catch(error => {
          console.error('Error fetching groupes musculaires:', error);
        });
    },
    checkSeanceStatus() {
      this.$axios.get(`/users/checkseance`)
        .then(response => {
          this.seanceStatus = response.data;
        })
        .catch(error => {
          console.error('Error checking seance status:', error);
        });
    },
    getImageUrl(photo) {
      return photo ? `${process.env.VUE_APP_API_URL}/uploads/exercice_custom/${photo}` : '/images/exercice.jpg';
    },
    openEditModal(exercice) {
      if (this.seanceStatus.id_status_seance !== null || this.seanceStatus.id_seance !== null) {
        return;
      }
      this.$axios.get(`/exercice_custom/getone/${exercice._id}`)
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

      this.$axios.post(`/exercice_custom/add`, formData)
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

      this.$axios.put(`/exercice_custom/edit/${this.selectedExercice._id}`, formData)
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
      this.$axios.put(`/exercice_custom/delete/${this.selectedExercice._id}`)
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
    },
    makeEditable(event) {
      event.target.readOnly = false;
    },
  },
  mounted() {
    this.fetchExercices();
    this.fetchGroupesMusculaires();
    this.checkSeanceStatus(); // Check seance status on mount
  }
};
</script>

<style scoped>
.exercice-container {
  max-width: 750px;
  padding-top: 50px;
  margin: auto;
}

.search-filter {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3em;
}

.search-filter input, .search-filter select {
  border-radius: 20px;
  padding: 10px 20px;
  border: solid 1px var(--couleurAdditionnelle-3);
  background-color: var(--couleurSecondaire-3);
  color: var(--couleurSecondaire-1);
  font-size: var(--tailleContenu);
}

.exercice-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.exercice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: var(--couleurSecondaire-4);
  cursor: pointer;
  transition: box-shadow 0.3s ease-in-out;
  width: 100%;
  border-radius: 20px;
  margin-bottom: 20px;
}

.exercice-item:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

.exercice-item img {
  width: 50px;
  height: 50px;
  margin-right: 1em;
  border-radius: 100%;
}

.exercice-item p {
  color: var(--couleurSecondaire-1);
  font-size: var(--tailleContenu);
  padding: 0;
  margin: 0;
}

.exercice-info {
  display: flex;
  align-items: center;
}

.exercice-info h3 {
  color: var(--couleurSecondaire-1);
  font-size: var(--tailleContenu);
  padding: 0;
  margin: 0;
}

.modal-contenu {
  position: relative;
}

.exercise-header {
  display: flex;
  gap: 50px;
  padding-bottom: 40px;
}

.exercise-header img {
  border-radius: 0;
  width: 100px;
  height: 100px;
}

.exercise-header h3 {
  font-size: var(--tailleTitre);
  font-family: var(--policeTitre);
  color: var(--couleurPrincipale-1);
  font-weight: bold;
}

.exercise-header h4 {
  font-size: var(--tailleContenu);
  font-family: var(--policeTitre);
  color: var(--couleurAccent-2);
  font-weight: normal;
}

.exercise-body {
  padding-bottom: 40px;
}

.exercise-body p, .exercise-body .exercise-video {
  width: 45%;
}

.exercise-body p {
  font-size: var(--tailleContenu);
  color: var(--couleurAccent-2);
}

.exercise-body, .exercise-video {
  border-radius: 20px;
}

.exercise-footer h4 {
  text-align: center;
  font-size: var(--tailleTitre);
  font-family: var(--policeTitre);
  color: var(--couleurPrincipale-1);
  font-weight: bold;
  padding-bottom: 20px;
}

.exercise-footer h5 {
  font-size: var(--tailleSousTitre);
  font-family: var(--policeTitre);
  color: var(--couleurPrincipale-1);
  font-weight: bold;
  padding-bottom: 10px;
}

.exercise-series {
  margin-bottom: 40px;
  padding: 10px 10px 0;
  border-bottom: solid 1px var(--couleurAdditionnelle-3);
}

.exercise-footer .exercise-series p {
  display: flex;
  justify-content: space-between;
  font-size: var(--tailleContenu);
  color: var(--couleurAccent-2);
}

.exercise-repos {
  text-align: center;
  font-size: var(--tailleSousTitre);
  color: var(--couleurAccent-2);
}

.addExerciseButton {
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
  border: none;
  border-radius: 20px;
  padding: 5px 20px;
  margin: 20px auto auto;
  display: block;
  font-size: var(--tailleTitre);
  font-family: var(--policeTitre);
  font-weight: bold;
}

.completed-series {
  background-color: var(--couleurAccent-1);
}

.completed-series h5 {
  color: var(--couleurSecondaire-2);
}

.exercise-footer .completed-series p {
  color: var(--couleurSecondaire-2);
}

.exercise-buttons button {
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
  border: none;
  border-radius: 20px;
  padding: 5px 20px;
  margin: 20px auto auto;
  display: block;
  font-size: var(--tailleTitre);
  font-family: var(--policeTitre);
  font-weight: bold;
}

.exercise-buttons p {
  text-align: center;
  font-size: var(--tailleSousTitre);
  color: var(--couleurAccent-2);
}

.error {
  color: red;
  margin-top: 10px;
}

form-group {
  padding-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--couleurPrincipale-1);
  font-weight: bold;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  padding-bottom: 10px;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  border-radius: 20px;
  border: none;
  font-size: var(--tailleContenu);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 10px 20px;
  color: var(--couleurAccent-2);
  font-size: var(--tailleContenu);
}

.form-group textarea {
  resize: none;
  height: 200px;
}

.form-group .formTitle {
  box-shadow: none;
  border-radius: 0;
  border-bottom: solid 1px var(--couleurAdditionnelle-3);
  color: var(--couleurPrincipale-1);
  font-size: var(--tailleTitre);
  font-weight: var(--policeTitre);
}

.series-form {
  display: flex;
  justify-content: space-between;
}

.form-group .mini-label {
  color: var(--couleurAccent-2);
}

.form-group-series {
  margin: auto;
  max-width: 200px;
}

.form-group-series label {
  text-align: center;
}

.boutonSupprimer {
  position: absolute;
  right: 0;
  top: 0;
  background-color: transparent;
  border: none;
}

.exercise-buttons {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
}

.boutonAjoutExercice {
  background-color: var(--couleurAccent-1);
  color: var(--couleurSecondaire-2);
  width: 50px;
  line-height: 50px;
  text-align: center;
  border-radius: 100%;
  padding: 0;
  margin: 0;
  border: none;
}
</style>
