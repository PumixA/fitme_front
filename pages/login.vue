<template>
  <div class="login">
    <div class="loginContent">
      <h1>Connexion</h1>
      <h2 class="subtitleLogin">Fitme (Bêta fermée)</h2>
      <form class="formLogin" @submit.prevent="login">
        <div class="formInputs">
          <label for="email">Pseudo ou email</label>
          <div class="formInput">
            <span><fa :icon="['far', 'user']" /></span>
            <input type="text" v-model="email" placeholder="Rentrez vos informations" required>
          </div>
        </div>
        <div class="formInputs">
          <label for="password">Mot de passe</label>
          <div class="formInput">
            <span><fa :icon="['fas', 'lock']" /></span>
            <input type="password" v-model="password" placeholder="Rentrez votre mot de passe" required>
          </div>
        </div>
        <p class="erreur" v-if="error">{{ error }}</p>
        <button type="submit">Se connecter</button>
      </form>


      <h2 class="subTitleBeta">Vous souhaitez participer à la bêta?</h2>
      <form class="formBeta" @submit.prevent="requestBetaAccess">

        <div class="formInputs">
          <label for="betaEmail">Email:</label>
          <div class="formInput">
            <span><fa :icon="['far', 'envelope']" /></span>
            <input type="email" v-model="betaEmail" placeholder="Rentrez votre email" required>
          </div>
        </div>
        <p class="erreur" v-if="betaError">{{ betaError }}</p>
        <p class="reussite" v-if="betaSuccess">{{ betaSuccess }}</p>
        <button type="submit">S'inscrire a la bêta</button>
        <p>*Si vous êtes selectionnés, vous allez recevoir un lien d'inscription</p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      email: '',
      password: '',
      betaEmail: '',
      error: '',
      betaError: '',
      betaSuccess: ''
    }
  },
  methods: {
    async login () {
      try {
        const response = await this.$axios.post('/users/login', {
          emailOrPseudo: this.email,
          password: this.password
        });
        const { token } = response.data;
        const {
          id: userId,
          role: userRole,
          exp
        } = this.parseJwt(token);

        const tokenExpiration = exp * 1000; // L'expiration du token en millisecondes

        this.$cookies.set('jwt', token, {
          path: '/',
          maxAge: exp - Math.floor(Date.now() / 1000)
        });
        this.$cookies.set('userId', userId, {
          path: '/',
          maxAge: exp - Math.floor(Date.now() / 1000)
        });
        this.$cookies.set('userRole', userRole, {
          path: '/',
          maxAge: exp - Math.floor(Date.now() / 1000)
        });

        this.$store.commit('setToken', {
          token,
          tokenExpiration
        });
        this.$store.commit('setUserId', userId);
        this.$store.commit('setUserRole', userRole);

        if (userRole === 'admin') {
          this.$router.push('/admin/adminDashboard');
        } else if (userRole === 'utilisateur') {
          this.$router.push('/utilisateur/dashboard');
        } else if (userRole === 'banni') {
          this.$router.push('/bannissement');
        } else {
          this.error = 'Role not recognized';
        }
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Login failed. Please check your credentials and try again.';
        }
      }
    },
    async requestBetaAccess () {
      try {
        const response = await this.$axios.post('/invitations/demandes_invitation', {
          email: this.betaEmail
        });
        this.betaSuccess = 'Demande envoyée avec succès';
        this.betaError = '';
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.betaError = error.response.data.message;
        } else {
          this.betaError = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    },
    parseJwt (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    }
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: auto;
  height: 100vh;
  display: flex;
  align-items: center;
}

.loginContent {
  background-color: var(--couleurSecondaire-3);
  padding: 40px 20px;
  border-radius: 20px;
  width: 100%;
}

.loginContent h1 {
  text-align: center;
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  color: var(--couleurSecondaire-1);
  font-weight: bold;
  padding-bottom: 10px;
}

.loginContent h2 {
  text-align: center;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  color: var(--couleurSecondaire-1);
  font-style: italic;
}

.subtitleLogin {
  padding-bottom: 40px;
}

.formInputs label {
  display: block;
  font-style: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  color: var(--couleurSecondaire-1);
  font-weight: bold;
  padding-bottom: 10px;
}

p {
  font-size: var(--tailleSpan);
  font-weight: lighter;
  color: var(--couleurSecondaire-1);
  padding-top: 5px;
}

.erreur {
  color: var(--couleurErreur);
}

.reussite {
  color: var(--couleurAccent-1);
}

.formInput {
  position: relative;
  width: 100%;
  padding-bottom: 30px;
}

.formInput span {
  position: absolute;
  left: 15px;
  top: 7px;
}

.formInput input {
  width: 100%;
  padding: 10px 20px 10px 40px;
  border-radius: 20px;
  border: solid 1px var(--couleurAdditionnelle-3);
  font-size: var(--tailleContenu);
  color: var(--couleurAccent-2);
}

.formLogin button {
  margin-bottom: 50px;
}

button {
  width: 100%;
  background-color: var(--couleurPrincipale-2);
  padding: 5px 20px;
  color: var(--couleurSecondaire-2);
  border: none;
  border-radius: 20px;
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  font-weight: bold;
  transition: all 0.5s
}

button:hover{
  opacity: 80%;
}
</style>
