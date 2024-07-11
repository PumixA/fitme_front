<template>
  <div class="profile">
    <h1>Profil</h1>
    <div class="profile-container">
      <div class="profile-header">
        <img :src="profileImage" alt="Photo de profil" class="profile-image" @click="openPhotoModal" />
        <div class="profile-info">
          <h2>{{ profile.pseudo }}</h2>
          <p>Inscrit le : {{ formatDate(profile.date_inscription) }}</p>
        </div>
      </div>
      <div class="profile-form">
        <div class="form-group">
          <label>Email (Non modifiable le temps de la bêta)</label>
          <input type="text" v-model="profile.email" readonly />
        </div>
        <div class="form-group" v-for="field in editableFields" :key="field">
          <label>{{ labels[field] }}</label>
          <input
            v-if="field !== 'genre'"
            v-model="profile[field]"
            :readonly="!isEditable[field]"
            @dblclick="makeEditable(field)"
            @blur="saveField(field)"
          />
          <select
            v-if="field === 'genre'"
            v-model="profile.genre"
            @change="saveField(field, true)"
          >
            <option value="homme">Homme</option>
            <option value="femme">Femme</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div class="form-group">
          <label>IMC</label>
          <input type="text" v-model="imc" readonly />
        </div>
      </div>
    </div>

    <!-- Modal for editing photo -->
    <Modal :visible="showPhotoModal" @close="closePhotoModal" title="Changer la photo de profil">
      <form @submit.prevent="uploadPhoto">
        <div class="form-group">
          <label for="photo">Photo</label>
          <input type="file" @change="handlePhotoChange" required />
        </div>
        <div class="modal-footer">
          <button type="button" @click="closePhotoModal" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script>
import Modal from '~/components/Modal.vue';

export default {
  middleware: 'auth',
  components: {
    Modal
  },
  data() {
    return {
      profile: {
        email: '',
        pseudo: '',
        nom: '',
        prenom: '',
        age: '',
        genre: '',
        poids: '',
        taille: '',
        photo_profil: '',
        date_inscription: ''
      },
      editableFields: ['nom', 'prenom', 'age', 'genre', 'poids', 'taille'],
      isEditable: {
        nom: false,
        prenom: false,
        age: false,
        genre: true, // Allow direct editing
        poids: false,
        taille: false
      },
      labels: {
        email: 'Email (Non modifiable le temps de la bêta)',
        pseudo: 'Pseudo',
        nom: 'Nom',
        prenom: 'Prénom',
        age: 'Age',
        genre: 'Sexe',
        poids: 'Poids',
        taille: 'Taille',
        imc: 'IMC'
      },
      imc: '',
      showPhotoModal: false,
      selectedPhoto: null,
      backendUrl: 'http://localhost:4000' // Direct URL to the backend
    };
  },
  computed: {
    profileImage() {
      return this.profile.photo_profil
        ? `${this.backendUrl}/uploads/users/${this.profile.photo_profil}`
        : '/images/photodeprofil.png';
    }
  },
  methods: {
    fetchProfile() {
      this.$axios.get(`${this.backendUrl}/api/users/get`)
        .then(response => {
          this.profile = response.data;
          this.calculateImc();
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
        });
    },
    calculateImc() {
      if (this.profile.poids && this.profile.taille) {
        const imcValue = (this.profile.poids / ((this.profile.taille / 100) ** 2)).toFixed(1);
        this.imc = imcValue > 0 ? imcValue : '';
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    },
    makeEditable(key) {
      this.$set(this.isEditable, key, true);
    },
    saveField(key, isSelect = false) {
      if (this.isEditable[key] || isSelect) {
        const updatedProfile = { ...this.profile };
        this.$axios.put(`${this.backendUrl}/api/users/edit`, updatedProfile)
          .then(() => {
            this.$set(this.isEditable, key, false);
            this.calculateImc(); // Recalculate IMC if weight or height changes
          })
          .catch(error => {
            console.error(`Error updating ${key}:`, error);
          });
      }
    },
    openPhotoModal() {
      this.showPhotoModal = true;
    },
    closePhotoModal() {
      this.showPhotoModal = false;
      this.selectedPhoto = null;
    },
    handlePhotoChange(event) {
      this.selectedPhoto = event.target.files[0];
    },
    uploadPhoto() {
      const formData = new FormData();
      formData.append('photo_profil', this.selectedPhoto);
      Object.keys(this.profile).forEach(key => {
        if (key !== 'photo_profil') {
          formData.append(key, this.profile[key]);
        }
      });

      this.$axios.put(`${this.backendUrl}/api/users/edit`, formData)
        .then(() => {
          this.closePhotoModal();
          this.fetchProfile(); // Refresh the profile to show the new photo
        })
        .catch(error => {
          console.error('Error uploading photo:', error);
        });
    }
  },
  mounted() {
    this.fetchProfile();
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 1em;
  cursor: pointer;
}

.profile-info h2 {
  margin: 0;
}

.profile-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
}

.form-group {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
}

.form-group input,
.form-group select {
  padding: 0.5em;
  margin-top: 0.5em;
}
</style>
