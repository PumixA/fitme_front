<template>
  <div>
    <h1>Tableau de bord</h1>
    <div v-if="noSessionToday" class="no-session">
      Aucune séance aujourd'hui
    </div>
    <div v-else>
      <h2>Séance du jour :</h2>
      <div v-for="session in sessions" :key="session._id" class="session">
        <h3>{{ session.nom }}</h3>
        <ul>
          <li v-for="exercise in session.exercises" :key="exercise._id">
            <img :src="getExerciseImage(exercise.id_exercice_custom.photo)" alt="Image de l'exercice" class="exercise-image" />
            <span>{{ exercise.id_exercice_custom.nom }}</span>
            <span>{{ getMuscleGroupName(exercise.id_exercice_custom.id_groupe_musculaire) }}</span>
          </li>
        </ul>
      </div>
      <button v-if="canStartSession" @click="startSession">Démarrer la séance</button>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      sessions: [],
      noSessionToday: false,
      muscleGroups: {},
      canStartSession: false,
    };
  },
  methods: {
    fetchDashboard() {
      this.$axios.get('/dashboard')
        .then(response => {
          if (response.data.length === 0) {
            this.noSessionToday = true;
          } else {
            this.noSessionToday = false;
            this.sessions = response.data;
            this.sessions.forEach(session => {
              this.fetchSessionDetails(session._id);
            });
            this.checkCanStartSession();
          }
        })
        .catch(error => {
          console.error('Error fetching dashboard:', error);
        });
    },
    fetchSessionDetails(sessionId) {
      this.$axios.get(`/seance/getone/${sessionId}`)
        .then(response => {
          const sessionIndex = this.sessions.findIndex(session => session._id === sessionId);
          this.$set(this.sessions, sessionIndex, { ...this.sessions[sessionIndex], exercises: response.data.exercices });
        })
        .catch(error => {
          console.error('Error fetching session details:', error);
        });
    },
    getExerciseImage(photo) {
      return photo ? `http://localhost:4000/uploads/exercice_custom/${photo}` : '/images/exercice.jpg';
    },
    getMuscleGroupName(groupIds) {
      return groupIds.map(id => this.muscleGroups[id]?.nom || 'Groupe musculaire').join(', ');
    },
    fetchMuscleGroups() {
      // Fetch and store muscle group names for displaying them
      this.$axios.get('/groupe_musculaire')
        .then(response => {
          response.data.forEach(group => {
            this.$set(this.muscleGroups, group._id, group);
          });
        })
        .catch(error => {
          console.error('Error fetching muscle groups:', error);
        });
    },
    checkCanStartSession() {
      this.$axios.get('/users/checkseance')
        .then(response => {
          this.canStartSession = response.data.id_status_seance === null && response.data.id_seance === null;
        })
        .catch(error => {
          console.error('Error checking session status:', error);
        });
    },
    startSession() {
      const sessionId = this.sessions[0]._id; // Assuming there's only one session for the day
      this.$axios.post(`/seance/start/${sessionId}`)
        .then(response => {
          console.log('Session started:', response.data);
          this.$router.push(`/utilisateur/gestionSeance?seanceId=${sessionId}`);
        })
        .catch(error => {
          console.error('Error starting session:', error);
        });
    }
  },
  mounted() {
    this.fetchDashboard();
    this.fetchMuscleGroups();
  }
};
</script>

<style scoped>
.no-session {
  text-align: center;
  font-size: 1.5rem;
  color: #666;
}

.session {
  margin-bottom: 2rem;
}

.exercise-image {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
