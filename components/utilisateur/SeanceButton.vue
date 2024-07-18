<template>
  <div>
    <div v-if="showButton" class="fixed-button" @click="handleButtonClick">
      <span v-if="isSameSeance && seanceInProgress">{{ chrono }}<span><fa :icon="['fas', 'stop']" /></span></span>
      <span v-else-if="shouldShowStartButton" @click.stop="startSeance">Commencer la séance<span><fa :icon="['fas', 'play']" /></span></span>
      <span v-else-if="seanceInProgress && !isSameSeance" @click="redirectToSeancePage">Une séance est en cours<span><fa :icon="['fas', 'chevron-right']" /></span></span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      buttonText: 'Aucune séance détectée',
      seanceStatus: 'Aucune séance en cours',
      isSameSeance: false,
      shouldShowStartButton: false,
      seanceInProgress: false,
      chrono: '',
      chronoInterval: null,
      seanceId: null,
      showButton: false,
    };
  },
  mounted() {
    this.checkCurrentPage();
    this.checkSeanceStatus();
  },
  watch: {
    '$route'() {
      this.checkCurrentPage();
      this.checkSeanceStatus();
    }
  },
  methods: {
    checkCurrentPage() {
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
    async checkSeanceStatus() {
      try {
        const response = await this.$axios.get('http://localhost:4000/api/users/checkseance');
        const { id_seance } = response.data;

        const urlParams = new URLSearchParams(window.location.search);
        const seanceId = urlParams.get('seanceId');
        this.seanceId = seanceId;

        if (id_seance) {
          this.seanceStatus = `En cours : ${id_seance}`;
          this.seanceInProgress = true;

          if (seanceId) {
            if (seanceId === id_seance) {
              this.isSameSeance = true;
              this.startChrono(id_seance);
              this.buttonText = `Séance id : ${seanceId}`;
            } else {
              this.isSameSeance = false;
              this.buttonText = `Vous avez une autre séance en cours`;
            }
          } else {
            this.isSameSeance = false;
            this.buttonText = 'Aucune séance détectée';
          }

          this.showButton = true;
        } else {
          this.seanceStatus = 'Aucune séance en cours';
          this.seanceInProgress = false;

          if (seanceId) {
            this.buttonText = `Séance id : ${seanceId}`;
            this.shouldShowStartButton = true;
          } else {
            this.buttonText = 'Aucune séance détectée';
          }

          this.showButton = !!seanceId;
        }
      } catch (error) {
        console.error('Error checking seance status:', error);
      }
    },
    checkIfSameSeance(id_seance) {
      this.isSameSeance = (this.seanceId === id_seance);
    },
    handleButtonClick() {
      if (this.isSameSeance && this.seanceInProgress) {
        this.endSeance();
      } else if (this.shouldShowStartButton) {
        this.startSeance();
      } else if (this.seanceInProgress && !this.isSameSeance) {
        this.redirectToSeancePage();
      }
    },
    async startSeance() {
      try {
        await this.$axios.post(`http://localhost:4000/api/seance/start/${this.seanceId}`);
        this.seanceInProgress = true;
        this.checkSeanceStatus();
        this.$router.go();
      } catch (error) {
        console.error('Error starting seance:', error);
      }
    },
    async endSeance() {
      try {
        await this.$axios.put(`http://localhost:4000/api/seance/end/${this.seanceId}`);
        this.seanceInProgress = false;
        this.clearChronoInterval();
        this.chrono = '';
        this.checkSeanceStatus();
        this.$router.go();
      } catch (error) {
        console.error('Error ending seance:', error);
      }
    },
    async startChrono(id_seance) {
      this.clearChronoInterval();

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
    updateChrono(elapsedTime) {
      const hours = Math.floor(elapsedTime / 3600);
      const minutes = Math.floor((elapsedTime % 3600) / 60);
      const seconds = elapsedTime % 60;
      this.chrono = `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    async redirectToSeancePage() {
      try {
        const response = await this.$axios.get('http://localhost:4000/api/users/checkseance');
        const { id_seance } = response.data;
        const urlParams = new URLSearchParams(window.location.search);
        const seanceId = urlParams.get('seanceId');


        if (id_seance && seanceId !== id_seance) {
          const redirectTo = `/utilisateur/gestionSeance?seanceId=${id_seance}`;
          window.location.href = redirectTo;
        } else {
          console.error('No active session found or already on the correct page.');
        }
      } catch (error) {
        console.error('Error during redirection:', error);
      }
    },
    clearChronoInterval() {
      if (this.chronoInterval) {
        clearInterval(this.chronoInterval);
        this.chronoInterval = null;
      }
    }
  },
  beforeDestroy() {
    this.clearChronoInterval();
  }
}
</script>

<style scoped>
.fixed-button {
  padding: 10px 20px;
  cursor: pointer;
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 300px;
  border-radius: 40px;
  border: none;
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  font-weight: bold;
  transition: all 0.5s;
}

.fixed-button span {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fixed-button:hover {
  opacity: 80%;
}
</style>
