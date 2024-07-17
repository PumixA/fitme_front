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
    <div v-if="!statistics || Object.keys(statistics).length === 0 || isStatisticsEmpty" class="no-data">
      Aucune Statistique
    </div>
    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart } from 'chart.js';

export default {
  middleware: 'auth',
  data() {
    return {
      exercises: [],
      selectedExercice: '',
      selectedFilter: '',
      startDate: '',
      endDate: '',
      statistics: {},
      chart: null,
    };
  },
  computed: {
    isStatisticsEmpty() {
      // Check if any statistics array is empty
      return Object.keys(this.statistics).length === 0;
    },
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
            this.statistics = response.data;
            if (Object.keys(this.statistics).length === 0) {
              this.statistics = {}; // Handle empty response
            } else {
              this.$nextTick(() => {
                this.renderChart();
              });
            }
          })
          .catch(error => {
            console.error('Error fetching statistics:', error);
            this.statistics = {};
          });
      } else {
        console.log('Please select all filters to fetch statistics.');
        this.statistics = {};
      }
    },
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }

      const ctx = this.$refs.chartCanvas;
      if (!ctx) {
        return;
      }

      const labels = [];
      const data = [];

      for (const [date, stats] of Object.entries(this.statistics)) {
        labels.push(new Date(date).toLocaleDateString('fr-FR'));
        if (this.selectedFilter === 'poids') {
          data.push(stats.stats.poids.length ? stats.stats.poids.reduce((a, b) => a + b, 0) / stats.stats.poids.length : 0);
        } else if (this.selectedFilter === 'rep') {
          data.push(stats.stats.nombre_rep);
        } else if (this.selectedFilter === 'serie') {
          data.push(stats.stats.numero_serie);
        }
      }

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Statistiques',
            backgroundColor: '#f87979',
            borderColor: '#f87979',
            data: data,
            fill: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
  },
  mounted() {
    this.fetchExercises();
  }
};
</script>

<style scoped>
.filter-container {
  margin-bottom: 2rem;
}

.no-data {
  text-align: center;
  font-size: 1.5rem;
  color: #666;
}

.chart-container {
  width: 100%;
  max-width: 800px;
  height: 400px;
  margin: 0 auto;
}

.chart-container canvas {
  width: 100% !important;
  height: auto !important;
}
</style>

