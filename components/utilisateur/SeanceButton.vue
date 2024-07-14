<template>
  <div>
    <div v-if="showButton" class="fixed-button" @click="handleButtonClick">
      {{ seanceStatus }} | {{ buttonText }}
      <span v-if="isSameSeance && seanceInProgress">| Arrêter la séance (Chrono: {{ chrono }})</span>
      <span v-else-if="shouldShowStartButton" @click.stop="startSeance">| Commencer la séance</span>
      <span v-else-if="seanceInProgress && !isSameSeance" @click="redirectToSeancePage">| Une séance est en cours</span>
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
    console.log('Mounted: Checking current page and seance status');
    this.checkCurrentPage();
    this.checkSeanceStatus();
  },
  watch: {
    '$route'() {
      console.log('Route changed: Checking current page and seance status');
      this.checkCurrentPage();
      this.checkSeanceStatus();
    }
  },
  methods: {
    checkCurrentPage() {
      console.log('Checking current page');
      const urlParams = new URLSearchParams(window.location.search);
      const seanceId = urlParams.get('seanceId');
      this.seanceId = seanceId;
      if (this.$route.path.startsWith('/utilisateur/gestionSeance') && seanceId) {
        this.buttonText = `Séance id : ${seanceId}`;
        console.log(`Current page seanceId set to: ${seanceId}`);
        this.checkIfSameSeance(seanceId);
        this.shouldShowStartButton = !this.seanceInProgress;
      } else {
        this.buttonText = 'Aucune séance détectée';
        this.isSameSeance = false;
        this.shouldShowStartButton = false;
      }
    },
    async checkSeanceStatus() {
      console.log('Checking seance status');
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
              console.log('SeanceId matches the active seanceId');
              this.isSameSeance = true;
              this.startChrono(id_seance);
              this.buttonText = `Séance id : ${seanceId}`;
            } else {
              console.log('SeanceId does not match the active seanceId');
              this.isSameSeance = false;
              this.buttonText = `Vous avez une autre séance en cours`;
            }
          } else {
            console.log('No seanceId in URL, active seance detected');
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
      console.log('Checking if same seance');
      this.isSameSeance = (this.seanceId === id_seance);
      console.log(`isSameSeance set to: ${this.isSameSeance}`);
    },
    handleButtonClick() {
      console.log('Button clicked');
      if (this.isSameSeance && this.seanceInProgress) {
        console.log('Ending seance');
        this.endSeance();
      } else if (this.shouldShowStartButton) {
        console.log('Starting seance');
        this.startSeance();
      } else if (this.seanceInProgress && !this.isSameSeance) {
        console.log('Redirecting to seance page');
        this.redirectToSeancePage();
      }
    },
    async startSeance() {
      console.log('Starting seance');
      try {
        await this.$axios.post(`http://localhost:4000/api/seance/start/${this.seanceId}`);
        this.seanceInProgress = true;
        console.log('Seance started successfully');
        this.checkSeanceStatus();
        this.$router.go();
      } catch (error) {
        console.error('Error starting seance:', error);
      }
    },
    async endSeance() {
      console.log('Ending seance');
      try {
        await this.$axios.put(`http://localhost:4000/api/seance/end/${this.seanceId}`);
        this.seanceInProgress = false;
        clearInterval(this.chronoInterval);
        this.chrono = '';
        console.log('Seance ended successfully');
        this.checkSeanceStatus();
        this.$router.go();
      } catch (error) {
        console.error('Error ending seance:', error);
      }
    },
    async startChrono(id_seance) {
      console.log('Starting chrono');
      try {
        const response = await this.$axios.get(`http://localhost:4000/api/seance/getchrono/${id_seance}`);
        const { elapsed_time_seconds } = response.data;
        console.log(`Elapsed time: ${elapsed_time_seconds} seconds`);
        this.updateChrono(elapsed_time_seconds);
        this.chronoInterval = setInterval(() => {
          this.updateChrono(elapsed_time_seconds + Math.floor((Date.now() - new Date(response.data.date_start).getTime()) / 1000));
        }, 1000);
      } catch (error) {
        console.error('Error fetching chrono:', error);
      }
    },
    updateChrono(elapsedTime) {
      console.log('Updating chrono');
      const hours = Math.floor(elapsedTime / 3600);
      const minutes = Math.floor((elapsedTime % 3600) / 60);
      const seconds = elapsedTime % 60;
      this.chrono = `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      console.log(`Chrono updated to: ${this.chrono}`);
    },
    async redirectToSeancePage() {
      console.log('Redirecting to seance page');
      try {
        const response = await this.$axios.get('http://localhost:4000/api/users/checkseance');
        const { id_seance } = response.data;
        const urlParams = new URLSearchParams(window.location.search);
        const seanceId = urlParams.get('seanceId');

        console.log('Current page seanceId:', seanceId);
        console.log('Active seanceId:', id_seance);

        if (id_seance && seanceId !== id_seance) {
          const redirectTo = `/utilisateur/gestionSeance?seanceId=${id_seance}`;
          console.log(`Redirecting to: ${redirectTo}`);
          window.location.href = redirectTo; // Force the redirection
        } else {
          console.error('No active session found or already on the correct page.');
        }
      } catch (error) {
        console.error('Error during redirection:', error);
      }
    }
  },
  beforeDestroy() {
    console.log('Component before destroy: Clearing chrono interval');
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
