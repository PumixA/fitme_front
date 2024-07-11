<template>
  <div>
    <h1 @dblclick="makeEditable">{{ seance.nom }}</h1>
    <input v-if="isEditingName" v-model="seance.nom" @blur="updateSeanceName" />
    <div class="days">
      <span
        v-for="day in days"
        :key="day.number"
        :class="{ active: seance.jour_seance && seance.jour_seance.includes(day.number) }"
        @click="toggleDay(day.number)"
      >
        {{ day.name }}
      </span>
    </div>
    <button @click="openAddExerciseModal" class="btn-primary">Ajouter un exercice</button>
    <draggable v-model="seance.exercices" @end="updateOrder">
      <div v-for="(exercice, index) in sortedExercices" :key="exercice._id" class="exercise-item" @click="openExerciceDetails(exercice.id_exercice_custom._id)">
        <img :src="getImagePath(exercice.id_exercice_custom.photo)" alt="Photo de l'exercice" />
        <div class="exercise-info">
          <h3>{{ exercice.id_exercice_custom.nom }}</h3>
          <p>{{ exercice.id_exercice_custom.id_groupe_musculaire[0].nom }}</p>
        </div>
        <button @click.stop="deleteExercice(seance._id, exercice.id_exercice_custom._id)" class="delete-btn">Supprimer</button>
      </div>
    </draggable>

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
        <p>{{ exerciseDetails.id_groupe_musculaire[0].nom }}</p>
        <p>{{ exerciseDetails.description }}</p>
        <div v-if="exerciseDetails.lien_video">
          <YoutubePlayer :video-id="extractYoutubeVideoId(exerciseDetails.lien_video)" />
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';
import YoutubePlayer from '~/components/YoutubePlayer.vue';
import draggable from 'vuedraggable';

export default {
  name: 'GestionSeance',
  components: {
    Modal,
    YoutubePlayer,
    draggable,
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
    };
  },
  computed: {
    sortedExercices() {
      return [...this.seance.exercices].sort((a, b) => a.ordre - b.ordre);
    },
  },
  methods: {
    fetchSeance() {
      const seanceId = this.$route.query.seanceId;
      this.$axios
        .get(`${this.backendUrl}/api/seance/getone/${seanceId}`)
        .then((response) => {
          this.seance = response.data.seance;
          this.seance.exercices = response.data.exercices.sort((a, b) => a.ordre - b.ordre);
        })
        .catch((error) => {
          console.error('Error fetching seance:', error);
        });
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
          id_exercice_custom: ex.id_exercice_custom._id,
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
    makeEditable(event) {
      this.isEditingName = true;
      this.$nextTick(() => {
        event.target.focus();
      });
    },
    updateSeanceName() {
      this.isEditingName = false;
      this.updateSeance();
    },
    extractYoutubeVideoId(url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    },
    updateOrder() {
      this.seance.exercices.forEach((ex, index) => {
        ex.ordre = index + 1;
      });
      this.updateSeance();
    },
    openExerciceDetails(exerciceId) {
      this.$axios
        .get(`${this.backendUrl}/api/exercice_custom/getone/${exerciceId}`)
        .then((response) => {
          this.exerciseDetails = response.data;
          this.showExerciseDetailsModal = true;
        })
        .catch((error) => {
          console.error('Error fetching exercice details:', error);
        });
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
  },
  mounted() {
    this.fetchSeance();
  },
};
</script>

<style scoped>
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
.exercise-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  cursor: pointer;
  position: relative;
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
</style>
