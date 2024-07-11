<template>
  <div>
    <h1>Seance</h1>
    <div class="search-filter">
      <input v-model="searchQuery" placeholder="Rechercher" />
      <button @click="filterByDay(null)" :class="{ active: selectedDay === null }">Tous</button>
      <button v-for="(day, index) in days" :key="index" @click="filterByDay(index + 1)" :class="{ active: selectedDay === index + 1 }">{{ day }}</button>
    </div>
    <div class="seance-list">
      <div v-for="seance in filteredSeances" :key="seance._id" class="seance-item">
        <div class="seance-name">{{ seance.nom }}</div>
        <div class="seance-days">
          <span v-for="day in seance.jour_seance" :key="day">{{ days[day - 1] }}</span>
        </div>
      </div>
    </div>
    <button @click="openCreateModal" class="add-seance-btn">+</button>

    <Modal :visible="showCreateModal" @close="closeCreateModal" title="Ajouter une séance">
      <form @submit.prevent="createSeance" class="modal-content">
        <div class="form-group">
          <label for="nom">Nom de la séance</label>
          <input type="text" v-model="newSeance.nom" required />
        </div>
        <div class="form-group">
          <label>Jour de la séance</label>
          <div class="days-selection">
            <button v-for="(day, index) in days" :key="index" type="button" @click="toggleDay(index + 1)" :class="{ active: newSeance.jour_seance.includes(index + 1) }">{{ day }}</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeCreateModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
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
      }
    };
  },
  computed: {
    filteredSeances() {
      return this.seances.filter(seance => {
        const matchesSearchQuery = seance.nom.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesDay = this.selectedDay !== null ? seance.jour_seance.includes(this.selectedDay) : true;
        return matchesSearchQuery && matchesDay;
      });
    }
  },
  methods: {
    fetchSeances() {
      this.$axios.get('http://localhost:4000/api/seance/getall')
        .then(response => {
          this.seances = response.data;
        })
        .catch(error => {
          console.error('Error fetching seances:', error);
        });
    },
    filterByDay(day) {
      this.selectedDay = day;
    },
    openCreateModal() {
      this.showCreateModal = true;
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
      this.$axios.post('http://localhost:4000/api/seance/add', this.newSeance)
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
  }
}
</script>

<style scoped>
.search-filter {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}

input[type="text"] {
  flex: 1;
  padding: 0.5em;
}

button {
  padding: 0.5em;
}

button.active {
  background-color: #1abc9c;
  color: white;
}

.seance-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.seance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  background-color: #f4f4f4;
  border: 1px solid #ddd;
}

.seance-item .seance-name {
  font-weight: bold;
}

.seance-item .seance-days {
  display: flex;
  gap: 0.5em;
}

.add-seance-btn {
  margin-top: 1em;
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  border-radius: 50%;
  font-size: 1.5em;
}

.add-seance-btn:hover {
  background-color: #16a085;
}

.modal-content {
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1em;
}

.days-selection {
  display: flex;
  gap: 0.5em;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1em;
}

.btn-primary {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
}

.btn-secondary {
  background-color: #ccc;
  color: #333;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
}

button.active {
  background-color: #1abc9c;
  color: white;
}
</style>
