<template>
  <div>
    <div class="seanceContainer">
      <div class="search-filter">
        <input v-model="searchQuery" placeholder="Rechercher" />
        <button @click="filterByDay(null)" :class="{ active: selectedDay === null }">Tous</button>
        <button v-for="(day, index) in days" :key="index" @click="filterByDay(index + 1)" :class="{ active: selectedDay === index + 1 }">{{ day }}</button>
      </div>
      <div class="seance-list">
        <div v-for="seance in filteredSeances" :key="seance._id" class="seance-item" @click="goToSeance(seance._id)">
          <div class="seance-name">{{ seance.nom }}</div>
          <div class="seance-days">
            <span v-for="day in seance.jour_seance" :key="day">{{ days[day - 1] }}</span>
          </div>
        </div>
      </div>
      <button v-if="!isSessionActive" @click="openCreateModal" class="add-seance-btn">+</button>
    </div>
    <Modal :visible="showCreateModal" @close="closeCreateModal">
      <form @submit.prevent="createSeance" class="modal-contenu">
        <div class="modal-top">
          <div class="form-group">
            <label for="nom">Nom de la séance</label>
            <input type="text" v-model="newSeance.nom" required />
          </div>
          <div class="form-group">
            <div class="days-selection">
              <button v-for="(day, index) in days" :key="index" type="button" @click="toggleDay(index + 1)" :class="{ active: newSeance.jour_seance.includes(index + 1) }">{{ day }}</button>
            </div>
          </div>
        </div>
        <div class="modal-bottom">
          <button type="button" @click="closeCreateModal" class="bouton-annuler">Annuler</button>
          <button type="submit" class="bouton-enregistrer">Enregistrer</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';

export default {
  name: 'Seance',
  components: {
    Modal
  },
  data() {
    return {
      seances: [],
      searchQuery: '',
      selectedDay: null,
      days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      showCreateModal: false,
      newSeance: {
        nom: '',
        jour_seance: []
      },
      seanceStatus: { id_status_seance: null, id_seance: null } // Initial state
    };
  },
  computed: {
    filteredSeances() {
      return this.seances.filter(seance => {
        const matchesSearchQuery = seance.nom.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesDay = this.selectedDay !== null ? seance.jour_seance.includes(this.selectedDay) : true;
        return matchesSearchQuery && matchesDay;
      });
    },
    isSessionActive() {
      return this.seanceStatus.id_status_seance !== null || this.seanceStatus.id_seance !== null;
    }
  },
  methods: {
    fetchSeances() {
      this.$axios.get('/seance/getall')
        .then(response => {
          this.seances = response.data;
        })
        .catch(error => {
          console.error('Error fetching seances:', error);
        });
    },
    checkSeanceStatus() {
      this.$axios.get('/users/checkseance')
        .then(response => {
          this.seanceStatus = response.data;
        })
        .catch(error => {
          console.error('Error checking seance status:', error);
        });
    },
    filterByDay(day) {
      this.selectedDay = day;
    },
    goToSeance(id) {
      this.$router.push({ path: '/utilisateur/gestionSeance', query: { seanceId: id } });
    },
    openCreateModal() {
      if (!this.isSessionActive) {
        this.showCreateModal = true;
      }
    },
    closeCreateModal() {
      this.showCreateModal = false;
      this.newSeance = {
        nom: '',
        jour_seance: []
      };
    },
    toggleDay(day) {
      const index = this.newSeance.jour_seance.indexOf(day);
      if (index > -1) {
        this.newSeance.jour_seance.splice(index, 1);
      } else {
        this.newSeance.jour_seance.push(day);
      }
    },
    createSeance() {
      this.$axios.post('/seance/add', this.newSeance)
        .then(() => {
          this.closeCreateModal();
          this.fetchSeances();
        })
        .catch(error => {
          console.error('Error creating seance:', error);
        });
    }
  },
  mounted() {
    this.fetchSeances();
    this.checkSeanceStatus(); // Check seance status on mount
  }
}
</script>

<style scoped>
.seanceContainer {
  max-width: 750px;
  padding-top: 50px;
  margin: auto;
}

.search-filter {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3em;
}

.search-filter input {
  border-radius: 20px;
  padding: 10px 20px;
  border: solid 1px var(--couleurAdditionnelle-3);
  background-color: var(--couleurSecondaire-3);
  color: var(--couleurSecondaire-1);
  font-size: var(--tailleContenu);
}

.search-filter button {
  background-color: var(--couleurSecondaire-4);
  border: none;
  border-radius: 100%;
  width: 50px;
  line-height: 50px;
  padding: 0;
  text-align: center;
  font-size: var(--tailleContenu);
  color: var(--couleurSecondaire-1);
}

button.active {
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
}

.seance-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.seance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: var(--couleurSecondaire-4);
  cursor: pointer;
  transition: box-shadow 0.3s ease-in-out;
  width: 100%;
  border-radius: 20px;
}

.seance-item:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

.seance-item .seance-name {
  color: var(--couleurSecondaire-1);
  font-size: var(--tailleContenu);
}

.seance-item .seance-days {
  display: flex;
  gap: 0.5em;
}

.seance-item .seance-days span {
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
  width: 25px;
  line-height: 25px;
  text-align: center;
  border-radius: 100%;
  font-size: var(--tailleSpan);
}

.add-seance-btn {
  margin-top: 1em;
  background-color: var(--couleurAccent-1);
  color: var(--couleurSecondaire-2);
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  border-radius: 20px;
  width: 100%;
  font-size: 1.5em;
  transition: all 0.5s
}

.add-seance-btn:hover {
  opacity: 80%;
}

.modal-top {
  overflow-y: scroll;
}

.form-group {
  padding-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--couleurPrincipale-1);
  font-weight: bold;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  padding-bottom: 10px;
}

.form-group input {
  width: 100%;
  border-radius: 20px;
  border: none;
  font-size: var(--tailleContenu);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 10px 20px;
  color: var(--couleurAccent-2);
  font-size: var(--tailleContenu);
}

.days-selection {
  display: flex;
  gap: 0.5em;
}

.days-selection button {
  border: none;
  padding: 0;
  background-color: var(--couleurSecondaire-4);
  color: var(--couleurSecondaire-1);
  width: 35px;
  line-height: 35px;
  text-align: center;
  border-radius: 100%;
  font-size: var(--tailleSpan);
}

.days-selection button.active {
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
}

.modal-bottom {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
}

.bouton-annuler {
  border: none;
  border-radius: 20px;
  background-color: var(--couleurSecondaire-3);
  color: var(--couleurSecondaire-2);
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  padding: 5px 0;
  width: 45%;
  transition: all 0.5s;
}

.bouton-enregistrer {
  border: none;
  border-radius: 20px;
  background-color: var(--couleurPrincipale-2);
  color: var(--couleurSecondaire-2);
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  padding: 5px 0;
  width: 45%;
  transition: all 0.5s;
}

.bouton-annuler:hover, .bouton-enregistrer:hover {
  opacity: 80%;
}

</style>
