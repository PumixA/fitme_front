<template>
  <div>
    <h2>Exercices Personnalisés</h2>
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Rechercher" />
      <select v-model="selectedGroup">
        <option value="">Tous les groupes</option>
        <option v-for="group in uniqueGroups" :key="group" :value="group">{{ group }}</option>
      </select>
    </div>
    <div class="exercice-list">
      <div v-for="exercice in filteredExercices" :key="exercice._id" class="exercice-item" @click="openEditModal(exercice)">
        <img :src="getImageUrl(exercice.photo)" alt="Photo de l'exercice" />
        <div class="exercice-info">
          <h3>{{ exercice.nom }}</h3>
          <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
        </div>
      </div>
    </div>
    <button @click="openCreateModal" class="btn-primary">Ajouter un exercice</button>

    <Modal :visible="showEditModal" @close="closeEditModal" title="Modifier l'exercice personnalisé">
      <div v-if="selectedExercice" class="modal-content">
        <img :src="getImageUrl(selectedExercice.photo)" alt="Photo de l'exercice" class="exercise-photo" @click="openImageModal"/>
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
          <input type="number" min="0" v-model="selectedExercice.nombre_series" @input="updateSeries" @blur="saveChanges" />
        </div>
        <div v-for="(serie, index) in series" :key="index" class="series-group">
          <h3>Série {{ index + 1 }}</h3>
          <div class="form-group">
            <label for="nombre_rep">Nombre de Répétitions</label>
            <input type="number" min="0" v-model="serie.nombre_rep" @blur="saveSeriesChanges" />
          </div>
          <div class="form-group">
            <label for="poids">Poids</label>
            <input type="number" min="0" v-model="serie.poids" @blur="saveSeriesChanges" />
          </div>
        </div>
        <div class="form-group">
          <label for="temps_repos">Temps de Repos (secondes)</label>
          <input type="number" min="0" v-model="selectedExercice.temps_repos" readonly @dblclick="makeEditable($event)" @blur="saveChanges" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeEditModal" class="btn-secondary">Annuler</button>
          <button type="button" @click="deleteExercice" class="btn-danger">Supprimer</button>
        </div>
      </div>
    </Modal>

    <Modal :visible="showCreateModal" @close="closeCreateModal" title="Ajouter un exercice personnalisé">
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
          <input type="number" min="0" v-model="newExercice.nombre_series" @input="updateNewSeries" required />
        </div>
        <div v-for="(serie, index) in newSeries" :key="index" class="series-group">
          <h3>Série {{ index + 1 }}</h3>
          <div class="form-group">
            <label for="nombre_rep">Nombre de Répétitions</label>
            <input type="number" min="0" v-model="serie.nombre_rep" />
          </div>
          <div class="form-group">
            <label for="poids">Poids</label>
            <input type="number" min="0" v-model="serie.poids" />
          </div>
        </div>
        <div class="form-group">
          <label for="temps_repos">Temps de Repos (secondes)</label>
          <input type="number" min="0" v-model="newExercice.temps_repos" required />
        </div>
        <div class="form-group">
          <label for="photo">Photo</label>
          <input type="file" accept=".jpg, .jpeg, .png" @change="handleNewImageUpload" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </Modal>

    <Modal :visible="showImageModal" @close="closeImageModal" title="Changer la photo de l'exercice">
      <form @submit.prevent="uploadImage" class="modal-content">
        <input type="file" accept=".jpg, .jpeg, .png" @change="handleImageUpload" />
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
      backendUrl: 'http://localhost:4000',
      series: [],
      newSeries: [{ index: 0, nombre_rep: 10, poids: 0 }]
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
    getImageUrl(photo) {
      return photo ? `${this.backendUrl}/uploads/exercice_custom/${photo}` : `${this.backendUrl}/images/exercice.jpg`;
    },
    openEditModal(exercice) {
      this.$axios.get(`${this.backendUrl}/api/exercice_custom/getone/${exercice._id}`)
        .then(response => {
          this.selectedExercice = response.data;
          this.series = this.selectedExercice.nombre_rep.map((rep, index) => ({
            index,
            nombre_rep: rep,
            poids: this.selectedExercice.poids[index]
          }));
          this.showEditModal = true;
        })
        .catch(error => {
          console.error('Error fetching exercice details:', error);
        });
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedExercice = null;
    },
    openCreateModal() {
      this.showCreateModal = true;
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
    },
    openImageModal() {
      this.showImageModal = true;
    },
    closeImageModal() {
      this.showImageModal = false;
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('nom', this.selectedExercice.nom);
        formData.append('id_groupe_musculaire', this.selectedExercice.id_groupe_musculaire[0]._id);
        formData.append('description', this.selectedExercice.description);
        formData.append('lien_video', this.selectedExercice.lien_video);
        formData.append('nombre_series', this.selectedExercice.nombre_series);
        formData.append('nombre_rep', JSON.stringify(this.series.map(serie => serie.nombre_rep)));
        formData.append('poids', JSON.stringify(this.series.map(serie => serie.poids)));
        formData.append('temps_repos', this.selectedExercice.temps_repos);

        this.$axios.put(`${this.backendUrl}/api/exercice_custom/edit/${this.selectedExercice._id}`, formData)
          .then(response => {
            this.selectedExercice.photo = response.data.photo;
            this.closeImageModal();
          })
          .catch(error => {
            console.error('Error uploading image:', error);
          });
      } else {
        alert('Veuillez sélectionner un fichier JPG ou PNG.');
      }
    },
    handleNewImageUpload(event) {
      const file = event.target.files[0];
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        this.newExercice.photo = file;
      } else {
        alert('Veuillez sélectionner un fichier JPG ou PNG.');
      }
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

      this.$axios.put(`${this.backendUrl}/api/exercice_custom/edit/${this.selectedExercice._id}`, formData)
        .then(() => {
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
    makeEditable(event) {
      event.target.readOnly = false;
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
  margin-bottom: 1em;
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
  width: 50px;
  height: 50px;
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
</style>
