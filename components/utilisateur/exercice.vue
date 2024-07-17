<template>
  <div>
    <h2>Exercices</h2>
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Rechercher" />
      <select v-model="selectedGroup">
        <option value="">Tous les groupes</option>
        <option v-for="group in uniqueGroups" :key="group" :value="group">{{ group }}</option>
      </select>
    </div>
    <div class="exercice-list">
      <div v-for="exercice in filteredExercices" :key="exercice._id" class="exercice-item" @click="openExerciceDetails(exercice._id)">
        <img :src="getImagePath(exercice.photo)" alt="Photo de l'exercice" />
        <div class="exercice-info">
          <h3>{{ exercice.nom }}</h3>
          <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
        </div>
      </div>
    </div>

    <Modal :visible="showModal" @close="closeModal" title="Détails de l'exercice">
      <div class="modal-content-scrollable">
        <div v-if="selectedExercice">
          <img :src="getImagePath(selectedExercice.photo)" alt="Photo de l'exercice" class="exercice-image" />
          <h3>{{ selectedExercice.nom }}</h3>
          <p>{{ selectedExercice.id_groupe_musculaire[0].nom }}</p>
          <p>{{ selectedExercice.description }}</p>
          <div v-if="selectedExercice.lien_video">
            <YoutubePlayer :video-id="extractYoutubeVideoId(selectedExercice.lien_video)" />
          </div>
          <button v-if="seanceStatus.id_status_seance === null && seanceStatus.id_seance === null" @click="addToMyExercices">Ajouter à mes exercices</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';
import YoutubePlayer from '~/components/YoutubePlayer.vue';

export default {
  name: 'Exercice',
  components: {
    Modal,
    YoutubePlayer
  },
  data() {
    return {
      exercices: [],
      searchQuery: '',
      selectedGroup: '',
      showModal: false,
      selectedExercice: null,
      backendUrl: 'http://localhost:4000', // Direct URL to the backend
      seanceStatus: { id_status_seance: null, id_seance: null } // Initial state
    }
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
      this.$axios.get(`${this.backendUrl}/api/exercice/getall`)
        .then(response => {
          this.exercices = response.data;
        })
        .catch(error => {
          console.error('Error fetching exercices:', error);
        });
    },
    getImagePath(photo) {
      return photo ? `${this.backendUrl}/uploads/exercices/${photo}` : '/images/exercice.jpg';
    },
    openExerciceDetails(id) {
      this.$axios.get(`${this.backendUrl}/api/exercice/getone/${id}`)
        .then(response => {
          this.selectedExercice = response.data;
          this.showModal = true;
        })
        .catch(error => {
          console.error('Error fetching exercice details:', error);
        });
    },
    closeModal() {
      this.showModal = false;
      this.selectedExercice = null;
    },
    addToMyExercices() {
      if (this.selectedExercice) {
        this.$axios.post(`${this.backendUrl}/api/exercice_custom/addfromexercice/${this.selectedExercice._id}`)
          .then(() => {
            this.closeModal();
          })
          .catch(error => {
            console.error('Error adding to custom exercices:', error);
          });
      }
    },
    extractYoutubeVideoId(url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
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
  },
  mounted() {
    this.fetchExercices();
    this.checkSeanceStatus();
  }
}
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

.modal-content-scrollable {
  max-height: 70vh; /* Adjust the height as needed */
  overflow-y: auto;
}
</style>
