<template>
  <div>
    <h2>Exercices Personnalisés</h2>
    <button @click="openCreateModal" class="btn-primary">Ajouter un exercice</button>
    <div v-for="exercice in exercices" :key="exercice._id" class="exercice-item" @click="openEditModal(exercice)">
      <img :src="getImageUrl(exercice.photo)" alt="Photo de l'exercice" class="exercise-photo"/>
      <div>{{ exercice.nom }}</div>
      <div>{{ exercice.id_groupe_musculaire[0].nom }}</div>
    </div>

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
          <input type="number" v-model="selectedExercice.nombre_series" @input="updateSeries" @blur="saveChanges" />
        </div>
        <div v-for="(serie, index) in series" :key="index" class="series-group">
          <h3>Série {{ index + 1 }}</h3>
          <div class="form-group">
            <label for="nombre_rep">Nombre de Répétitions</label>
            <input type="number" v-model="serie.nombre_rep" @blur="saveSeriesChanges" />
          </div>
          <div class="form-group">
            <label for="poids">Poids</label>
            <input type="number" v-model="serie.poids" @blur="saveSeriesChanges" />
          </div>
        </div>
        <div class="form-group">
          <label for="temps_repos">Temps de Repos (secondes)</label>
          <input type="number" v-model="selectedExercice.temps_repos" readonly @dblclick="makeEditable($event)" @blur="saveChanges" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeEditModal" class="btn-secondary">Annuler</button>
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
          <input type="number" v-model="newExercice.nombre_series" @input="updateNewSeries" required />
        </div>
        <div v-for="(serie, index) in newSeries" :key="index" class="series-group">
          <h3>Série {{ index + 1 }}</h3>
          <div class="form-group">
            <label for="nombre_rep">Nombre de Répétitions</label>
            <input type="number" v-model="serie.nombre_rep" />
          </div>
          <div class="form-group">
            <label for="poids">Poids</label>
            <input type="number" v-model="serie.poids" />
          </div>
        </div>
        <div class="form-group">
          <label for="temps_repos">Temps de Repos (secondes)</label>
          <input type="number" v-model="newExercice.temps_repos" required />
        </div>
        <div class="form-group">
          <label for="photo">Photo</label>
          <input type="file" @change="handleNewImageUpload" />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </Modal>

    <Modal :visible="showImageModal" @close="closeImageModal" title="Changer la photo de l'exercice">
      <form @submit.prevent="uploadImage" class="modal-content">
        <input type="file" @change="handleImageUpload" />
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
    },
    handleNewImageUpload(event) {
      const file = event.target.files[0];
      this.newExercice.photo = file;
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
.exercice-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 1em;
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
