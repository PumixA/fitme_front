<template>
  <div>
    <div v-if="seanceStatus !== 'Aucune séance en cours' || buttonText !== 'Aucune séance détectée'" class="fixed-button" @click="handleButtonClick">
      {{ seanceStatus }} | {{ buttonText }}
      <span v-if="isSameSeance && seanceInProgress">| Arrêter la séance (Chrono: {{ chrono }})</span>
      <span v-else-if="shouldShowStartButton" @click.stop="startSeance">| Commencer la séance</span>
      <span v-else-if="seanceInProgress && !isSameSeance" @click="redirectToSeancePage">| Une séance est en cours</span>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      buttonText: 'Aucune séance détectée',
      seanceStatus: 'Aucune séance en cours',
      isSameSeance: false,
      shouldShowStartButton: false,
      seanceInProgress: false,
      chrono: '',
      chronoInterval: null,
      seanceId: null
    };
  },
  mounted () {
    this.checkCurrentPage();
    this.checkSeanceStatus();
  },
  watch: {
    '$route' () {
      this.checkCurrentPage();
      this.checkSeanceStatus();
    }
  },
  methods: {
    checkCurrentPage () {
      const urlParams = new URLSearchParams(window.location.search);
      const seanceId = urlParams.get('seanceId');
      this.seanceId = seanceId;
      if (this.$route.path.startsWith('/utilisateur/gestionSeance') && seanceId) {
        this.buttonText = `Séance id : ${seanceId}`;
        this.checkIfSameSeance(seanceId);
        this.shouldShowStartButton = !this.seanceInProgress;
      } else {
        this.buttonText = 'Aucune séance détectée';
        this.isSameSeance = false;
        this.shouldShowStartButton = false;
      }
    },
    async checkSeanceStatus () {
      try {
        const response = await this.$axios.get('http://localhost:4000/api/users/checkseance');
        const { id_seance } = response.data;
        if (id_seance) {
          this.seanceStatus = `En cours : ${id_seance}`;
          this.seanceInProgress = true;
          this.checkIfSameSeance(id_seance);
          this.shouldShowStartButton = false;
          if (this.isSameSeance) {
            this.startChrono(id_seance);
          }
        } else {
          this.seanceStatus = 'Aucune séance en cours';
          this.seanceInProgress = false;
          this.isSameSeance = false;
          if (this.$route.path.startsWith('/utilisateur/gestionSeance') && this.seanceId) {
            this.shouldShowStartButton = true;
          }
        }
      } catch (error) {
        console.error('Error checking seance status:', error);
      }
    },
    checkIfSameSeance (id_seance) {
      this.isSameSeance = (this.seanceId === id_seance);
    },
    handleButtonClick () {
      if (this.shouldShowStartButton) {
        this.startSeance();
      } else if (this.isSameSeance && this.seanceInProgress) {
        this.endSeance();
      } else if (this.seanceInProgress && !this.isSameSeance) {
        this.redirectToSeancePage();
      }
    },
    async startSeance () {
      try {
        await this.$axios.post(`http://localhost:4000/api/seance/start/${this.seanceId}`);
        this.seanceInProgress = true;
        this.checkSeanceStatus();
        this.$router.go();
      } catch (error) {
        console.error('Error starting seance:', error);
      }
    },
    async endSeance () {
      try {
        await this.$axios.put(`http://localhost:4000/api/seance/end/${this.seanceId}`);
        this.seanceInProgress = false;
        clearInterval(this.chronoInterval);
        this.chrono = '';
        this.checkSeanceStatus();
        this.$router.go();
      } catch (error) {
        console.error('Error ending seance:', error);
      }
    },
    async startChrono (id_seance) {
      try {
        const response = await this.$axios.get(`http://localhost:4000/api/seance/getchrono/${id_seance}`);
        const { elapsed_time_seconds } = response.data;
        this.updateChrono(elapsed_time_seconds);
        this.chronoInterval = setInterval(() => {
          this.updateChrono(elapsed_time_seconds + Math.floor((Date.now() - new Date(response.data.date_start).getTime()) / 1000));
        }, 1000);
      } catch (error) {
        console.error('Error fetching chrono:', error);
      }
    },
    updateChrono (elapsedTime) {
      const hours = Math.floor(elapsedTime / 3600);
      const minutes = Math.floor((elapsedTime % 3600) / 60);
      const seconds = elapsedTime % 60;
      this.chrono = `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    async redirectToSeancePage () {
      try {
        const response = await this.$axios.get('http://localhost:4000/api/users/checkseance');
        const { id_seance } = response.data;
        if (id_seance) {
          this.$router.push({
            path: '/utilisateur/gestionSeance',
            query: { seanceId: id_seance }
          });
        } else {
          console.error('No active session found.');
        }
      } catch (error) {
        console.error('Error redirecting to seance page:', error);
      }
    }
  },
  beforeDestroy () {
    clearInterval(this.chronoInterval);
  }
}
</script>

<style scoped>
.fixed-button {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: #1abc9c;
  color: white;
  cursor: pointer;
  z-index: 1000;
  text-align: center;
  white-space: nowrap;
}
</style>
