<template>
  <div>
    <h1>Statistiques</h1>
    <div class="filter-container">
      <select v-model="selectedExercice" @change="fetchStatistics">
        <option value="" disabled>Choisissez un exercice</option>
        <option v-for="exercise in exercises" :key="exercise._id" :value="exercise._id">
          {{ exercise.nom }}
        </option>
      </select>
      <select v-model="selectedFilter" @change="fetchStatistics">
        <option value="" disabled>Choisissez un filtre</option>
        <option value="poids">Poids</option>
        <option value="rep">Réps</option>
        <option value="serie">Séries</option>
      </select>
      <input type="date" v-model="startDate" @change="fetchStatistics" />
      <input type="date" v-model="endDate" @change="fetchStatistics" />
    </div>
    <!-- Contenu de la page -->
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      exercises: [],
      selectedExercice: '',
      selectedFilter: '',
      startDate: '',
      endDate: '',
    };
  },
  methods: {
    fetchExercises() {
      this.$axios.get('/exercice_custom/getall')
        .then(response => {
          this.exercises = response.data;
        })
        .catch(error => {
          console.error('Error fetching exercises:', error);
        });
    },
    fetchStatistics() {
      if (this.selectedExercice && this.selectedFilter && this.startDate && this.endDate) {
        this.$axios.get('/stat/seance/get', {
          params: {
            exercice: this.selectedExercice,
            filter: this.selectedFilter,
            startDate: this.startDate,
            endDate: this.endDate,
          }
        })
          .then(response => {
            console.log('Statistics response:', response.data);
          })
          .catch(error => {
            console.error('Error fetching statistics:', error);
          });
      } else {
        console.log('Please select all filters to fetch statistics.');
      }
    },
  },
  mounted() {
    this.fetchExercises();
  },
};
</script>

<style scoped>
.filter-container {
  margin-bottom: 2rem;
}
</style>
