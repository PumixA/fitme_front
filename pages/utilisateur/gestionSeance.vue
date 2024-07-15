<template>
  <div>
    <div v-if="isSeanceEnCours" class="seance-en-cours-text">Cette séance est en cours</div>
    <h1 @dblclick="handleDoubleClick">{{ seance.nom }}</h1>
    <input v-if="isEditingName" v-model="seance.nom" @blur="updateSeanceName" @keyup.enter="updateSeanceName" />
    <div class="days">
      <span
        v-for="day in days"
        :key="day.number"
        v-if="!isSeanceEnCours || (isSeanceEnCours && seance.jour_seance && seance.jour_seance.includes(day.number))"
        :class="{ active: seance.jour_seance && seance.jour_seance.includes(day.number), 'non-clickable': isSeanceEnCours }"
        @click="!isSeanceEnCours && toggleDay(day.number)"
      >
        {{ day.name }}
      </span>
    </div>
    <button v-if="!isSeanceEnCours" @click="openAddExerciseModal" class="btn-primary">Ajouter un exercice</button>
    <draggable v-model="seance.exercices" :disabled="isSeanceEnCours" @end="updateOrder">
      <div
        v-for="(exercice, index) in sortedExercices"
        :key="exercice._id"
        :class="['exercise-item', { 'effectue': exercice.status === 'effectue' }]"
        @click="openExerciceDetails(exercice.id_exercice_custom?._id || exercice.exercice?._id)"
      >
        <img :src="getImagePath(exercice.id_exercice_custom?.photo || exercice.exercice?.photo)" alt="Photo de l'exercice" />
        <div class="exercise-info">
          <h3>{{ exercice.id_exercice_custom?.nom || exercice.exercice?.nom }}</h3>
          <p>{{ exercice.id_exercice_custom?.id_groupe_musculaire[0]?.nom || exercice.exercice?.id_groupe_musculaire[0]?.nom }}</p>
        </div>
        <button v-if="!isSeanceEnCours" @click.stop="deleteExercice(seance._id, exercice.id_exercice_custom?._id || exercice.exercice?._id)" class="delete-btn">Supprimer</button>
      </div>
    </draggable>
    <button v-if="!isSeanceEnCours" @click="deleteSeance" class="btn-delete-seance">Supprimer la séance</button>

    <!-- Modal for adding exercise -->
    <Modal :visible="showAddExerciseModal" @close="closeAddExerciseModal" title="Ajouter un exercice">
      <div class="modal-content">
        <div v-for="exercice in allExercices" :key="exercice._id" class="exercise-item" @click="selectExercise(exercice)">
          <img :src="getImagePath(exercice.photo)" alt="Photo de l'exercice" />
          <div class="exercise-info">
            <h3>{{ exercice.nom }}</h3>
            <p>{{ exercice.id_groupe_musculaire[0].nom }}</p>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Modal for viewing selected exercise -->
    <Modal :visible="showSelectedExerciseModal" @close="closeSelectedExerciseModal" title="Détails de l'exercice">
      <div v-if="selectedExercice" class="modal-content">
        <img :src="getImagePath(selectedExercice.photo)" alt="Photo de l'exercice" class="exercise-image" />
        <h3>{{ selectedExercice.nom }}</h3>
        <p>{{ selectedExercice.id_groupe_musculaire[0].nom }}</p>
        <p>{{ selectedExercice.description }}</p>
        <div v-if="selectedExercice.lien_video">
          <YoutubePlayer :video-id="extractYoutubeVideoId(selectedExercice.lien_video)" />
        </div>
        <button @click="addToSeance">Ajouter à la séance</button>
      </div>
    </Modal>

    <!-- Modal for viewing exercise details in session -->
    <Modal :visible="showExerciseDetailsModal" @close="closeExerciseDetailsModal" title="Détails de l'exercice">
      <div v-if="exerciseDetails" class="modal-content">
        <img :src="getImagePath(exerciseDetails.photo)" alt="Photo de l'exercice" class="exercise-image" />
        <h3>{{ exerciseDetails.nom }}</h3>
        <p>{{ exerciseDetails.id_groupe_musculaire[0]?.nom }}</p>
        <p>{{ exerciseDetails.description }}</p>
        <div v-if="exerciseDetails.lien_video">
          <YoutubePlayer :video-id="extractYoutubeVideoId(exerciseDetails.lien_video)" />
        </div>
        <div v-if="isSeanceEnCours && exerciseDetails">
          <h4>Séries: {{ exerciseDetails.nombre_series }}</h4>
          <div v-for="(rep, index) in exerciseDetails.nombre_rep" :key="index" :class="{ 'completed-series': exerciseDetails.completedSeries[index] }">
            <h5>Série {{ index + 1 }}</h5>
            <p>Reps: {{ rep }} | Poids: {{ exerciseDetails.poids[index] }}</p>
            <hr />
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
        jour_seance: [],
        exercices: [],
      },
      allExercices: [],
      selectedExercice: null,
      exerciseDetails: null,
      showAddExerciseModal: false,
      showSelectedExerciseModal: false,
      showExerciseDetailsModal: false,
      backendUrl: 'http://localhost:4000',
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
      isSeanceEnCours: false, // New property to track if the current session is ongoing
    };
  },
  computed: {
    sortedExercices() {
      return [...this.seance.exercices].sort((a, b) => a.ordre - b.ordre);
    },
  },
  methods: {
    handleDoubleClick(event) {
      if (!this.isSeanceEnCours) {
        this.isEditingName = true;
        this.$nextTick(() => {
          event.target.focus();
        });
      }
    },
    async fetchSeance() {
      const seanceId = this.$route.query.seanceId;
      try {
        if (this.isSeanceEnCours) {
          await this.fetchSeanceEnCours(seanceId); // Fetch exercises for the ongoing session
        } else {
          const response = await this.$axios.get(`${this.backendUrl}/api/seance/getone/${seanceId}`);
          this.seance = response.data.seance;
          this.seance.exercices = response.data.exercices.sort((a, b) => a.ordre - b.ordre);
        }
      } catch (error) {
        console.error('Error fetching seance:', error);
      }
    },
    async checkIfSeanceEnCours(seanceId) {
      try {
        const response = await this.$axios.get('http://localhost:4000/api/users/checkseance');
        if (response.data.id_seance === seanceId) {
          this.isSeanceEnCours = true;
          await this.fetchSeanceEnCours(seanceId); // Fetch exercises for the ongoing session
        } else {
          this.isSeanceEnCours = false;
          await this.fetchSeance(); // Fetch exercises for the regular session
        }
      } catch (error) {
        console.error('Error checking seance status:', error);
      }
    },
    async fetchSeanceEnCours(seanceId) {
      try {
        const response = await this.$axios.get(`${this.backendUrl}/api/seance/start/get_exercices/${seanceId}`);
        this.seance = response.data.seance;
        this.seance.exercices = response.data.exercices.sort((a, b) => a.ordre - b.ordre);
      } catch (error) {
        console.error('Error fetching seance en cours:', error);
      }
    },
    async fetchExerciseDetails(seanceId, exerciceId) {
      try {
        const response = await this.$axios.get(`${this.backendUrl}/api/seance/start/getone_exercice/${seanceId}/${exerciceId}`);
        const { exerciceCustom, statusExercice } = response.data;

        // Compare series and mark completed ones
        const completedSeries = exerciceCustom.nombre_rep.map((rep, index) => {
          return statusExercice.nombre_rep[index] === rep &&
            statusExercice.poids[index] === exerciceCustom.poids[index] &&
            statusExercice.temps_repos[index] !== undefined;  // Assuming that a non-null temps_repos indicates completion
        });

        this.exerciseDetails = {
          ...exerciceCustom,
          statusExercice,
          completedSeries
        };
        this.showExerciseDetailsModal = true;
      } catch (error) {
        console.error('Error fetching exercise details:', error);
      }
    },
    getImagePath(photo) {
      return photo ? `${this.backendUrl}/uploads/exercice_custom/${photo}` : '/images/exercice.jpg';
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
        .put(`${this.backendUrl}/api/seance/edit/${seanceId}`, data)
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
        .get(`${this.backendUrl}/api/exercice_custom/getall`)
        .then((response) => {
          this.allExercices = response.data;
        })
        .catch((error) => {
          console.error('Error fetching all exercices:', error);
        });
    },
    selectExercise(exercice) {
      this.$axios
        .get(`${this.backendUrl}/api/exercice_custom/getone/${exercice._id}`)
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
          .get(`${this.backendUrl}/api/exercice_custom/getone/${exerciceId}`)
          .then((response) => {
            this.exerciseDetails = response.data;
            this.showExerciseDetailsModal = true;
          })
          .catch((error) => {
            console.error('Error fetching exercice details:', error);
          });
      }
    },
    closeExerciseDetailsModal() {
      this.showExerciseDetailsModal = false;
    },
    deleteExercice(seanceId, exerciceCustomId) {
      this.$axios
        .put(`${this.backendUrl}/api/seance/deleteExercice/${seanceId}/${exerciceCustomId}`)
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
        .put(`${this.backendUrl}/api/seance/delete/${seanceId}`)
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
};
</script>

<style scoped>
.seance-en-cours-text {
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}
.days {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.days span {
  padding: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
}
.days .active {
  background-color: #1abc9c;
  color: white;
}
.days .non-clickable {
  cursor: not-allowed;
  pointer-events: none;
}
.exercise-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  cursor: pointer;
  position: relative;
}
.exercise-item.effectue {
  background-color: green;
}
.exercise-item:hover {
  background-color: #e0e0e0;
}
.exercise-item img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}
.exercise-info {
  display: flex;
  flex-direction: column;
}
.modal-content {
  max-height: 70vh;
  overflow-y: auto;
}
.exercise-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
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
.delete-btn {
  background-color: red;
  color: white;
  padding: 0.5em;
  border: none;
  border-radius: 5px;
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
.delete-btn:hover {
  background-color: darkred;
}
.btn-delete-seance {
  background-color: red;
  color: white;
  padding: 0.5em 1em;
  border: none;
  cursor: pointer;
  margin-top: 20px;
}
.btn-delete-seance:hover {
  background-color: darkred;
}

.completed-series {
  background-color: green;
}
</style>
