<template>
  <div>
    <h1>{{ seance.nom }}</h1>
    <div class="days">
      <span v-for="day in seance.jour_seance" :key="day">{{ days[day - 1] }}</span>
    </div>
    <div class="exercises">
      <div v-for="exercise in exercices" :key="exercise._id" class="exercise-card">
        <div class="exercise-header">
          <h3>{{ exercise.id_exercice_custom.nom }}</h3>
          <button @click="deleteExercise(exercise._id)">🗑️</button>
        </div>
        <img :src="getImagePath(exercise.id_exercice_custom.photo)" alt="Image de l'exercice" class="exercise-image" />
        <p>{{ exercise.id_exercice_custom.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      seance: {},
      exercices: [],
      days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    };
  },
  methods: {
    fetchSeanceDetails(id) {
      this.$axios.get(`http://localhost:4000/api/seance/getone/${id}`)
        .then(response => {
          this.seance = response.data.seance;
          this.exercices = response.data.exercices;
        })
        .catch(error => {
          console.error('Error fetching seance details:', error);
        });
    },
    getImagePath(photo) {
      return photo ? `http://localhost:4000/uploads/exercice_custom/${photo}` : '/images/exercice.jpg';
    },
    deleteExercise(id) {
      // Logique de suppression d'un exercice (à implémenter)
    }
  },
  mounted() {
    const seanceId = this.$route.query.seanceId;
    if (seanceId) {
      this.fetchSeanceDetails(seanceId);
    }
  }
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 1em;
}

.days {
  display: flex;
  justify-content: center;
  gap: 0.5em;
  margin-bottom: 1em;
}

.exercises {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  justify-content: center;
}

.exercise-card {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  padding: 1em;
  width: 200px;
  text-align: center;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}

.exercise-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  margin-bottom: 1em;
}
</style>
