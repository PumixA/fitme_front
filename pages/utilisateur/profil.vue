<template>
  <div class="profile">
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-info">
          <img :src="profileImage" alt="Photo de profil" class="profile-image" @click="openPhotoModal" />
          <h2>{{ profile.pseudo }}</h2>
        </div>
        <p>Inscrit le : {{ formatDate(profile.date_inscription) }}</p>
      </div>
      <div class="profile-form">
        <div class="form-group full-width">
          <label>Email (Non modifiable le temps de la bêta)</label>
          <input type="text" v-model="profile.email" readonly />
        </div>
        <div class="form-row">
          <div class="form-group" v-for="field in ['nom', 'prenom']" :key="field">
            <label>{{ labels[field] }}</label>
            <input
              :type="isNumberField(field) ? 'number' : 'text'"
              v-model="profile[field]"
              :readonly="!isEditable[field] || isSessionActive"
              @dblclick="makeEditable(field)"
              @blur="saveField(field)"
              :min="isNumberField(field) ? 0 : null"
              :class="{ 'input-error': isNegativeNumber(profile[field]) }"
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ labels['age'] }}</label>
            <input
              type="number"
              v-model="profile['age']"
              :readonly="!isEditable['age'] || isSessionActive"
              @dblclick="makeEditable('age')"
              @blur="saveField('age')"
              min="0"
              :class="{ 'input-error': isNegativeNumber(profile['age']) }"
            />
          </div>
          <div class="form-group">
            <label>{{ labels['genre'] }}</label>
            <select
              v-model="profile.genre"
              @change="saveField('genre', true)"
              :disabled="isSessionActive"
            >
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ labels['poids'] }}</label>
            <input
              type="number"
              v-model="profile['poids']"
              :readonly="!isEditable['poids'] || isSessionActive"
              @dblclick="makeEditable('poids')"
              @blur="saveField('poids')"
              min="0"
              :class="{ 'input-error': isNegativeNumber(profile['poids']) }"
            />
          </div>
          <div class="form-group">
            <label>{{ labels['taille'] }}</label>
            <input
              type="number"
              v-model="profile['taille']"
              :readonly="!isEditable['taille'] || isSessionActive"
              @dblclick="makeEditable('taille')"
              @blur="saveField('taille')"
              min="0"
              :class="{ 'input-error': isNegativeNumber(profile['taille']) }"
            />
          </div>
        </div>
        <div class="form-group full-width center">
          <label>IMC</label>
          <input type="text" v-model="imc" readonly />
          <span class="imcSpan">*L’IMC est votre indice de masse corporelle, il est calculé automatiquement en fonction de votre poids et de votre taille</span>
        </div>
      </div>
    </div>

    <!-- Modal for editing photo -->
    <Modal :visible="showPhotoModal" @close="closePhotoModal" title="Changer la photo de profil">
      <form @submit.prevent="uploadPhoto">
        <div class="form-group">
          <label for="photo">Photo</label>
          <input type="file" @change="handlePhotoChange" accept=".jpg, .jpeg, .png" required />
          <span v-if="photoError" class="error-message">{{ photoError }}</span>
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
      photoError: '',
      seanceStatus: { id_status_seance: null, id_seance: null } // Initial state
    };
  },
  computed: {
    profileImage() {
      return this.profile.photo_profil
        ? `${process.env.VUE_APP_API_URL}/uploads/users/${this.profile.photo_profil}`
        : '/images/photodeprofil.png';
    },
    isSessionActive() {
      return this.seanceStatus.id_status_seance !== null || this.seanceStatus.id_seance !== null;
    }
  },
  methods: {
    fetchProfile() {
      this.$axios.get(`/users/get`)
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
      if (!this.isSessionActive) {
        this.$set(this.isEditable, key, true);
      }
    },
    saveField(key, isSelect = false) {
      if ((this.isEditable[key] || isSelect) && !this.isSessionActive) {
        if (this.isNegativeNumber(this.profile[key])) {
          this.showFieldError(key, 'La valeur ne peut pas être négative.');
          return;
        }
        const updatedProfile = { ...this.profile };
        this.$axios.put(`/users/edit`, updatedProfile)
          .then(() => {
            this.$set(this.isEditable, key, false);
            this.calculateImc(); // Recalculate IMC if weight or height changes
          })
          .catch(error => {
            console.error(`Error updating ${key}:`, error);
          });
      }
    },
    showFieldError(key, message) {
      this.$set(this.isEditable, key, false);
      alert(message);
    },
    openPhotoModal() {
      if (!this.isSessionActive) {
        this.showPhotoModal = true;
      }
    },
    closePhotoModal() {
      this.showPhotoModal = false;
      this.selectedPhoto = null;
      this.photoError = '';
    },
    handlePhotoChange(event) {
      const file = event.target.files[0];
      if (!file.type.match('image/png') && !file.type.match('image/jpeg')) {
        this.photoError = 'Seuls les fichiers PNG et JPG sont autorisés.';
        return;
      }
      this.selectedPhoto = file;
      this.photoError = '';
    },
    uploadPhoto() {
      if (this.photoError) {
        return;
      }

      const formData = new FormData();
      formData.append('photo_profil', this.selectedPhoto);
      Object.keys(this.profile).forEach(key => {
        if (key !== 'photo_profil') {
          formData.append(key, this.profile[key]);
        }
      });

      this.$axios.put(`/users/edit`, formData)
        .then(() => {
          this.closePhotoModal();
          this.fetchProfile(); // Refresh the profile to show the new photo
        })
        .catch(error => {
          console.error('Error uploading photo:', error);
        });
    },
    isNegativeNumber(value) {
      return typeof value === 'number' && value < 0;
    },
    isNumberField(field) {
      return ['age', 'poids', 'taille'].includes(field);
    },
    checkSeanceStatus() {
      this.$axios.get(`/users/checkseance`)
        .then(response => {
          this.seanceStatus = response.data;
        })
        .catch(error => {
          console.error('Error checking seance status:', error);
        });
    }
  },
  mounted() {
    this.fetchProfile();
    this.checkSeanceStatus(); // Check seance status on mount
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 40px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 1em;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 1em;
  cursor: pointer;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-info h2 {
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.form-group {
  flex: 1 1 45%;
  display: flex;
  flex-direction: column;
  margin: 0.5em;
}

.full-width {
  flex: 1 1 100%;
}

.center {
  display: flex;
  justify-content: center;
}

.form-group label {
  display: block;
  color: var(--couleurAccent-2);
  font-weight: bold;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  padding-bottom: 10px;
}

.form-group input, .form-group select {
  max-width: 100%;
  border-radius: 20px;
  border: none;
  font-size: var(--tailleContenu);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 10px 20px;
  color: var(--couleurAccent-2);
  font-size: var(--tailleContenu);
}

.input-error {
  border-color: red;
}

.error-message {
  color: red;
  margin-top: 0.5em;
}

.imcSpan {
  font-size: var(--tailleSpan);
  color: var(--couleurAccent-2);
  padding-top: 10px;
}
</style>

