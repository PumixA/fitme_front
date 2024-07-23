<template>
  <div>
    <div class="gestionSeanceContainer">
      <div class="gestionSeanceHeader">
        <div class="gestionSeanceHeaderContainer">
          <h1 v-if="!isEditingName" :class="{ 'non-clickable': isSeanceEnCours || isAnotherSeanceEnCours }" @dblclick="handleDoubleClick">{{ seance.nom }}</h1>
          <input v-if="isEditingName" v-model="seance.nom" @blur="updateSeanceName" @keyup.enter="updateSeanceName" />
          <div class="days">
      <span
        v-for="day in days"
        :key="day.number"
        v-if="!isSeanceEnCours || (isSeanceEnCours && seance.jour_seance && seance.jour_seance.includes(day.number))"
        :class="{ active: seance.jour_seance && seance.jour_seance.includes(day.number), 'non-clickable': isSeanceEnCours || isAnotherSeanceEnCours }"
        @click="!isSeanceEnCours && !isAnotherSeanceEnCours && toggleDay(day.number)"
      >
        {{ day.name }}
      </span>
          </div>
          <button v-if="!isSeanceEnCours && !isAnotherSeanceEnCours" @click="deleteSeance" class="btn-delete-seance"><fa :icon="['fas', 'trash']" /></button>
        </div>
        <button v-if="!isSeanceEnCours && !isAnotherSeanceEnCours" @click="openAddExerciseModal" class="boutonAjouterExo">Ajouter un exercice</button>
      </div>
      <div class="gestionSeanceBody">
        <draggable v-model="seance.exercices" :disabled="isSeanceEnCours || isAnotherSeanceEnCours" @end="updateOrder" class="exercise-list">
          <div
            v-for="(exercice, index) in sortedExercices"
            :key="exercice._id"
            :class="['exercise-item exercice-item-drag', { 'effectue': exercice.status === 'effectue' }]"
            @click="openExerciceDetails(exercice.id_exercice_custom?._id || exercice.exercice?._id)"
          >
            <div class="exercise-info">
              <h3>{{ exercice.id_exercice_custom?.nom || exercice.exercice?.nom }}</h3>
              <button v-if="!isSeanceEnCours && !isAnotherSeanceEnCours" @click.stop="deleteExercice(seance._id, exercice.id_exercice_custom?._id || exercice.exercice?._id)" class="delete-btn"><fa :icon="['fas', 'trash']" /></button>
            </div>
            <div class="infoImage" :style="{ backgroundImage: `url(${getImagePath(exercice.id_exercice_custom?.photo || exercice.exercice?.photo)})` }"></div>
          </div>
        </draggable>
      </div>
    </div>

    <!-- Modal for adding exercise -->
    <Modal :visible="showAddExerciseModal" @close="closeAddExerciseModal">
      <div class="modal-contenu">
        <div v-for="exercice in allExercices" :key="exercice._id" class="exercise-item" @click="selectExercise(exercice)">
          <div class="exercise-info">
            <img :src="getImagePath(exercice.photo)" alt="Photo de l'exercice" />
            <span>{{ exercice.nom }}</span>
          </div>
          <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
        </div>
      </div>
    </Modal>

    <!-- Modal for viewing selected exercise (when session is not started) -->
    <Modal v-if="!isSeanceEnCours && !isAnotherSeanceEnCours && selectedExercice" :visible="showSelectedExerciseModal" @close="closeSelectedExerciseModal">
      <div class="modal-contenu-2">
        <div class="exercise-header">
          <img :src="getImagePath(selectedExercice.photo)" alt="Photo de l'exercice" class="exercise-image" />
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
        <div class="exercise-footer">
          <h4>Séries: {{ selectedExercice.nombre_series }}</h4>
          <div v-for="(rep, index) in selectedExercice.nombre_rep" :key="index" class="exercise-series">
            <h5>Série {{ index + 1 }}</h5>
            <p><span>Reps: {{ rep }}</span><span>Poids: {{ selectedExercice.poids[index] }}</span></p>
            <hr />
          </div>
          <p class="exercise-repos">Temps de repos: {{ formatTime(selectedExercice.temps_repos) }}</p>
        </div>

        <button v-if="showAddExerciseModal" @click="addToSeance" class="addExerciseButton">Ajouter à la séance</button>
      </div>
    </Modal>

    <!-- Modal for viewing exercise details in session (when session is started) -->
    <Modal v-if="isSeanceEnCours && exerciseDetails" :visible="showExerciseDetailsModal" @close="closeExerciseDetailsModal">
      <div class="modal-contenu-2">
        <div class="exercise-header">
          <img :src="getImagePath(exerciseDetails.photo)" alt="Photo de l'exercice" class="exercise-image" />
          <div class="exercise-headerRight">
            <h3>{{ exerciseDetails.nom }}</h3>
            <p>{{ exerciseDetails.id_groupe_musculaire[0]?.nom }}</p>
          </div>
        </div>
        <div class="exercise-body">
          <p>{{ exerciseDetails.description }}</p>
          <div v-if="exerciseDetails.lien_video"  class="exercise-video">
            <YoutubePlayer :video-id="extractYoutubeVideoId(exerciseDetails.lien_video)"  />
          </div>
        </div>
        <div class="exercise-footer">
          <h4>Séries: {{ exerciseDetails.nombre_series }}</h4>
          <div v-for="(rep, index) in exerciseDetails.nombre_rep" :key="index" :class="{ 'completed-series': exerciseDetails.completedSeries[index] }" class="exercise-series">
            <h5>Série {{ index + 1 }}</h5>
            <p><span>Reps: {{ rep }}</span><span>Poids: {{ exerciseDetails.poids[index] }}</span></p>
            <hr />
          </div>
        </div>

        <div v-if="!isSeanceEnCours">
          <p class="exercise-repos">Temps de repos: {{ formatTime(exerciseDetails.temps_repos) }}</p>
        </div>

        <div v-if="isSeanceEnCours" class="exercise-buttons">
          <div v-if="exerciseDetails.statusExercice.status === 'non_effectue'">
            <button @click="handleExerciseAction(exerciseDetails._id)">Démarrer l'exercice</button>
          </div>
          <div v-else-if="exerciseDetails.statusExercice.status === 'en_cours'">
            <div v-if="exerciseDetails.statusExercice.numero_serie < exerciseDetails.nombre_series && !exerciseDetails.sameNumberReps">
              <div v-if="!exerciseDetails.resting && !exerciseDetails.finishedResting">
                <p>Chrono: {{ formatTime(chrono) }}</p>
                <button @click="handleExerciseAction(exerciseDetails._id)">Terminer cette série</button>
              </div>
              <div v-else-if="exerciseDetails.finishedResting">
                <p>Repos: 0s</p>
                <button @click="handleExerciseAction(exerciseDetails._id)">Passer à la série suivante</button>
              </div>
              <div v-else>
                <p>Repos: {{ formatTime(restTimeLeft > 0 ? restTimeLeft : 0) }}</p>
                <button @click="handleExerciseAction(exerciseDetails._id)">
                  {{ restTimeLeft > 0 ? 'Repos en cours | Passer à la série suivante' : 'Passer à la série suivante' }}
                </button>
              </div>
            </div>
            <div v-else-if="exerciseDetails.sameNumberReps">
              <button @click="handleExerciseAction(exerciseDetails._id)">Terminer l'exercice</button>
            </div>
          </div>
          <div v-else-if="exerciseDetails.statusExercice.status === 'effectue'">
            <p>Exercice terminé</p>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Start/Stop Session Button -->
    <SeanceButton />
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';
import YoutubePlayer from '~/components/YoutubePlayer.vue';
import draggable from 'vuedraggable';
import SeanceButton from '~/components/utilisateur/SeanceButton.vue';

export default {
  name: 'GestionSeance',
  components: {
    Modal,
    YoutubePlayer,
    draggable,
    SeanceButton,
  },
  data() {
    return {
      seance: {
        nom: '',
        jour_seance: [],
        exercices: [],
      },
      allExercices: [],
      selectedExercice: null,
      exerciseDetails: null,
      showAddExerciseModal: false,
      showSelectedExerciseModal: false,
      showExerciseDetailsModal: false,
      days: [
        { name: 'Lun', number: 1 },
        { name: 'Mar', number: 2 },
        { name: 'Mer', number: 3 },
        { name: 'Jeu', number: 4 },
        { name: 'Ven', number: 5 },
        { name: 'Sam', number: 6 },
        { name: 'Dim', number: 7 },
      ],
      isEditingName: false,
      isSeanceEnCours: false,
      isAnotherSeanceEnCours: false,
      chrono: 0,
      restTimeLeft: 0,
      chronoInterval: null,
      restInterval: null,
    };
  },
  computed: {
    sortedExercices() {
      return [...this.seance.exercices].sort((a, b) => a.ordre - b.ordre);
    },
  },
  methods: {
    async handleExerciseAction(exerciceId) {
      try {
        await this.$axios.put(`/seance/start/do_exercise/edit/${exerciceId}`);
        await this.fetchExerciseDetails(this.$route.query.seanceId, exerciceId);
        await this.fetchSeance(); // Update the exercise list background color
        this.exerciseDetails.finishedResting = false; // Reset finishedResting when action is handled
      } catch (error) {
        console.error('Error handling exercise action:', error);
      }
    },

    formatTime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return [
        h > 0 ? `${h}h` : null,
        m > 0 ? `${m}m` : null,
        `${s}s`
      ].filter(Boolean).join(' ');
    },

    async fetchExerciseDetails(seanceId, exerciceId) {
      try {
        const response = await this.$axios.get(`/seance/start/getone_exercice/${seanceId}/${exerciceId}`);
        const { exerciceCustom, statusExercice } = response.data;

        const isResting = statusExercice.temps_repos.length > statusExercice.numero_serie;
        const sameNumberReps = exerciceCustom.nombre_rep.length === statusExercice.nombre_rep.length;

        this.exerciseDetails = {
          ...exerciceCustom,
          statusExercice,
          temps_repos: exerciceCustom.temps_repos,
          completedSeries: exerciceCustom.nombre_rep.map((rep, index) => {
            return statusExercice.nombre_rep[index] === rep &&
              statusExercice.poids[index] === exerciceCustom.poids[index] &&
              statusExercice.temps_repos[index] !== undefined;
          }),
          resting: isResting,
          finishedResting: false,
          sameNumberReps: sameNumberReps,
          restTimeLeft: isResting ? Math.max(exerciceCustom.temps_repos - Math.floor((new Date().getTime() - new Date(statusExercice.date_start).getTime()) / 1000), 0) : null,
        };


        this.showExerciseDetailsModal = true;

        if (statusExercice.status === 'en_cours' && statusExercice.date_start && !isResting) {
          this.startChrono(statusExercice.date_start);
        }

        if (isResting) {
          this.startRestCountdown();
        }
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      }
    },

    async selectExercise(exercice) {
      try {
        const response = await this.$axios.get(`/exercice_custom/getone/${exercice._id}`);
        this.selectedExercice = response.data;
        this.showSelectedExerciseModal = true;
      } catch (error) {
        console.error('Error fetching selected exercice:', error);
      }
    },

    startChrono(startTime) {
      if (this.chronoInterval) {
        clearInterval(this.chronoInterval);
      }
      const start = new Date(startTime).getTime();
      this.chronoInterval = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        this.chrono = elapsed;
      }, 1000);
    },

    startRestCountdown() {
      if (this.restInterval) {
        clearInterval(this.restInterval);
      }
      const restTime = this.exerciseDetails.temps_repos; // Utiliser directement la valeur en secondes
      this.restTimeLeft = restTime; // Initialise restTimeLeft avec le temps de repos total


      this.restInterval = setInterval(() => {
        this.restTimeLeft -= 1;
        this.exerciseDetails.restTimeLeft = this.restTimeLeft;

        if (this.restTimeLeft <= 0) { // Bloquer à 0 seconde
          clearInterval(this.restInterval);
          this.exerciseDetails.resting = false; // Arrête le repos
          this.exerciseDetails.finishedResting = true; // Marque la fin du repos
          this.restTimeLeft = 0; // Bloquer à 0 seconde pour affichage
        }
      }, 1000);
    },

    closeExerciseDetailsModal() {
      this.showExerciseDetailsModal = false;
      clearInterval(this.chronoInterval);
      clearInterval(this.restInterval);
    },

    handleDoubleClick(event) {
      if (!this.isSeanceEnCours && !this.isAnotherSeanceEnCours) {
        this.isEditingName = true;
        this.$nextTick(() => {
          event.target.focus();
        });
      }
    },

    async fetchSeance() {
      const seanceId = this.$route.query.seanceId;
      try {
        const response = await this.$axios.get(`/seance/getone/${seanceId}`);
        this.seance = response.data.seance;
        this.seance.exercices = response.data.exercices.sort((a, b) => a.ordre - b.ordre);
      } catch (error) {
        console.error('Error fetching seance:', error);
      }
    },

    async checkIfSeanceEnCours(seanceId) {
      try {
        const response = await this.$axios.get('/users/checkseance');
        if (response.data.id_seance === seanceId) {
          this.isSeanceEnCours = true;
          await this.fetchSeanceEnCours(seanceId); // Fetch exercises for the ongoing session
        } else if (response.data.id_seance !== null && response.data.id_status_seance !== null) {
          this.isAnotherSeanceEnCours = true;
          await this.fetchSeance(); // Fetch exercises for the regular session
        } else {
          this.isSeanceEnCours = false;
          this.isAnotherSeanceEnCours = false;
          await this.fetchSeance(); // Fetch exercises for the regular session
        }
      } catch (error) {
        console.error('Error checking seance status:', error);
      }
    },

    async fetchSeanceEnCours(seanceId) {
      try {
        const response = await this.$axios.get(`/seance/start/get_exercices/${seanceId}`);
        this.seance = response.data.seance;
        this.seance.exercices = response.data.exercices.sort((a, b) => a.ordre - b.ordre);
      } catch (error) {
        console.error('Error fetching seance en cours:', error);
      }
    },

    getImagePath(photo) {
      return photo ? `${process.env.VUE_APP_API_URL}/uploads/exercice_custom/${photo}` : '/images/exercice.jpg';
    },

    toggleDay(day) {
      if (!this.seance.jour_seance) {
        this.seance.jour_seance = [];
      }
      const index = this.seance.jour_seance.indexOf(day);
      if (index === -1) {
        this.seance.jour_seance.push(day);
      } else {
        this.seance.jour_seance.splice(index, 1);
      }
      this.updateSeance();
    },

    updateSeance() {
      const seanceId = this.$route.query.seanceId;
      const data = {
        exercices: this.seance.exercices.map((ex, index) => ({
          id_exercice_custom: ex.id_exercice_custom?._id || ex.exercice?._id,
          ordre: index + 1,
        })),
        jour_seance: this.seance.jour_seance,
        nom: this.seance.nom,
      };
      this.$axios
        .put(`/seance/edit/${seanceId}`, data)
        .then(() => {
          this.fetchSeance();
        })
        .catch((error) => {
          console.error('Error updating seance:', error);
        });
    },

    openAddExerciseModal() {
      this.fetchAllExercices();
      this.showAddExerciseModal = true;
    },

    closeAddExerciseModal() {
      this.showAddExerciseModal = false;
    },

    fetchAllExercices() {
      this.$axios
        .get(`/exercice_custom/getall`)
        .then((response) => {
          this.allExercices = response.data;
        })
        .catch((error) => {
          console.error('Error fetching all exercices:', error);
        });
    },

    selectExercise(exercice) {
      this.$axios
        .get(`/exercice_custom/getone/${exercice._id}`)
        .then((response) => {
          this.selectedExercice = response.data;
          this.showSelectedExerciseModal = true;
        })
        .catch((error) => {
          console.error('Error fetching selected exercice:', error);
        });
    },

    closeSelectedExerciseModal() {
      this.showSelectedExerciseModal = false;
    },

    addToSeance() {
      this.seance.exercices.push({
        id_exercice_custom: this.selectedExercice,
        ordre: this.seance.exercices.length + 1,
      });
      this.updateSeance();
      this.closeSelectedExerciseModal();
      this.closeAddExerciseModal();
    },

    updateSeanceName() {
      this.isEditingName = false;
      this.updateSeance();
    },

    updateOrder() {
      this.updateSeance();
    },

    openExerciceDetails(exerciceId) {
      if (this.isSeanceEnCours) {
        this.fetchExerciseDetails(this.$route.query.seanceId, exerciceId);
      } else {
        this.$axios
          .get(`/exercice_custom/getone/${exerciceId}`)
          .then((response) => {
            this.selectedExercice = response.data;
            this.showSelectedExerciseModal = true;
          })
          .catch((error) => {
            console.error('Error fetching exercice details:', error);
          });
      }
    },

    closeExerciseDetailsModal() {
      this.showExerciseDetailsModal = false;
      clearInterval(this.chronoInterval);
      clearInterval(this.restInterval);
    },

    deleteExercice(seanceId, exerciceCustomId) {
      this.$axios
        .put(`/seance/deleteExercice/${seanceId}/${exerciceCustomId}`)
        .then(() => {
          this.fetchSeance();
        })
        .catch((error) => {
          console.error('Error deleting exercice:', error);
        });
    },

    deleteSeance() {
      const seanceId = this.$route.query.seanceId;
      this.$axios
        .put(`/seance/delete/${seanceId}`)
        .then(() => {
          this.$router.push('/utilisateur/seance');
        })
        .catch((error) => {
          console.error('Error deleting seance:', error);
        });
    },

    extractYoutubeVideoId(url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    },
  },

  async mounted() {
    await this.checkIfSeanceEnCours(this.$route.query.seanceId);
  },

  watch: {
    '$route.query.seanceId': 'checkIfSeanceEnCours'
  }
};
</script>

<style scoped>
.gestionSeanceContainer {
  margin: 0 40px;
}
.gestionSeanceHeader {
  padding-bottom: 40px;
}
.gestionSeanceHeaderContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
}
.gestionSeanceHeaderContainer h1 {
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  color: var(--couleurPrincipale-1);
  font-weight: bold;
}
.gestionSeanceHeaderContainer input {
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  color: var(--couleurPrincipale-1);
  font-weight: bold;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom: solid var(--couleurSecondaire-1) 1px;
  padding: 0;
}
.days {
  display: flex;
  gap: 10px;
}
.days span {
  border: none;
  padding: 0;
  background-color: var(--couleurSecondaire-4);
  color: var(--couleurSecondaire-1);
  width: 35px;
  line-height: 35px;
  text-align: center;
  border-radius: 100%;
  font-size: var(--tailleSpan);
  cursor: pointer;
}
.days .active {
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
}
.days .non-clickable {
  cursor: not-allowed;
  pointer-events: none;
}
.non-clickable {
  pointer-events: none;
}
.boutonAjouterExo {
  background-color: var(--couleurAccent-1);
  color: var(--couleurSecondaire-2);
  padding: 10px 20px;
  border-radius: 20px;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  border: none;
  transition: all 0.5s;
}
.boutonAjouterExo:hover {
  opacity: 80%;
}
.exercice-item-drag {
  width: 24%;
  background-color: var(--couleurSecondaire-2);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.5s;
  padding: 10px 20px;
}
.exercise-item.effectue {
  background-color: var(--couleurAccent-1);
}
.exercise-item:hover {
  opacity: 80%;
}
.infoImage {
  width: 100%;
  height: 90px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.exercise-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
}
.exercise-info h3 {
  font-size: var(--tailleContenu);
  color: var(--couleurAccent-2);
  font-weight: normal;
}
.exercise-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.modal-contenu .exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: var(--couleurSecondaire-4);
  cursor: pointer;
  transition: box-shadow 0.3s ease-in-out;
  width: 415px;
  border-radius: 20px;
  margin-bottom: 20px;
}
.modal-contenu .exercise-item img {
  border-radius: 100%;
  width: 50px;
  height: 50px;
  margin-right: 1rem;
}
.modal-contenu .exercise-info {
  padding-bottom: 0;
}
.modal-contenu p {
  padding: 0;
  margin: 0;
}
.exercise-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}
.delete-btn {
  background-color: transparent;
  color: var(--couleurAccent-2);
  padding: 0.5em;
  border: none;
  cursor: pointer;
  font-size: var(--tailleContenu);
}
.delete-btn:hover {
  background-color: transparent;
  opacity: 80%;
}
.btn-delete-seance {
  color: var(--couleurAccent-2);
  padding: 0.5em 1em;
  border: none;
  cursor: pointer;
  transition: all 0.5s;
  background-color: transparent;
}
.btn-delete-seance:hover {
  opacity: 80%;
  background-color: transparent;
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

.exercise-series {
  margin-bottom: 40px;
  padding: 10px 10px 0;
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
</style>
