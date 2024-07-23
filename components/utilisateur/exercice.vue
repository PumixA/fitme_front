<template>
  <div>
    <div class="exercice-container">
      <div class="search-filter">
        <input v-model="searchQuery" placeholder="Rechercher" />
        <select v-model="selectedGroup">
          <option value="">Tous les groupes</option>
          <option v-for="group in uniqueGroups" :key="group" :value="group">{{ group }}</option>
        </select>
      </div>
      <div class="exercice-list">
        <div v-for="exercice in filteredExercices" :key="exercice._id" class="exercice-item" @click="openExerciceDetails(exercice._id)">
          <div class="exercice-info">
            <img :src="getImagePath(exercice.photo)" alt="Photo de l'exercice" />
            <h3>{{ exercice.nom }}</h3>
          </div>
          <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
        </div>
      </div>
    </div>

    <Modal :visible="showModal" @close="closeModal" title="Détails de l'exercice">
      <div class="modal-contenu">
        <div v-if="selectedExercice">
          <div class="exercise-header">
            <img :src="getImagePath(selectedExercice.photo)" alt="Photo de l'exercice" class="exercice-image" />
            <div class="exercise-headerRight">
              <h3>{{ selectedExercice.nom }}</h3>
              <p>{{ selectedExercice.id_groupe_musculaire[0].nom }}</p>
            </div>
          </div>
          <div class="exercise-body">
            <p>{{ selectedExercice.description }}</p>
            <div v-if="selectedExercice.lien_video" class="exercise-video">
              <YoutubePlayer :video-id="extractYoutubeVideoId(selectedExercice.lien_video)" />
            </div>
          </div>
          <button v-if="seanceStatus.id_status_seance === null && seanceStatus.id_seance === null" @click="addToMyExercices" class="addExerciseButton">Ajouter à mes exercices</button>
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
      this.$axios.get(`/exercice/getall`)
        .then(response => {
          this.exercices = response.data;
        })
        .catch(error => {
          console.error('Error fetching exercices:', error);
        });
    },
    getImagePath(photo) {
      return photo ? `${process.env.VUE_APP_API_URL}/uploads/exercices/${photo}` : '/images/exercice.jpg';
    },
    openExerciceDetails(id) {
      this.$axios.get(`/exercice/getone/${id}`)
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
        this.$axios.post(`/exercice_custom/addfromexercice/${this.selectedExercice._id}`)
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
      this.$axios.get(`/users/checkseance`)
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

.exercice-image {
  width: 100px;
  height: 100px;
  margin-bottom: 1em;
}

.exercise-header {
  display: flex;
  gap: 50px;
  padding-bottom: 40px;
}

.exercise-header img {
  border-radius: 0;
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
  display: flex;
  justify-content: space-between;
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
</style>
