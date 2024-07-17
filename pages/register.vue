<template>
  <div class="register">
    <div class="registerContent">
      <h1>Inscription</h1>
      <h2>Fitme (Bêta fermée)</h2>
      <form class="formRegister" v-if="isTokenValid" @submit.prevent="register">
        <div class="formInputs">
          <label for="pseudo">Pseudo</label>
          <div class="formInput">
            <span><fa :icon="['far', 'user']" /></span>
            <input type="text" v-model="pseudo" placeholder="Rentrez votre pseudo" required>
          </div>
        </div>
        <div class="formInputs">
          <label for="email">Email</label>
          <div class="formInput">
            <span><fa :icon="['far', 'envelope']" /></span>
            <input type="email" v-model="email" placeholder="Rentrez votre email" required>
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
        <button type="submit">S'inscrire</button>
      </form>
      <div class="loginBottom">
        <p>Déjà un compte?</p>
        <nuxt-link to="/login" class="loginLink">Se connecter</nuxt-link>
      </div>

    </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      pseudo: '',
      email: '',
      password: '',
      error: '',
      isTokenValid: false
    }
  },
  async created() {
    const token = this.$route.params.token;
    if (!token) {
      this.$router.push('/login');
      return;
    }

    try {
      await this.$axios.get(`/users/register/verifytoken/${token}`);
      this.isTokenValid = true;
    } catch (error) {
      this.$router.push('/login');
    }
  },
  methods: {
    async register() {
      const token = this.$route.params.token;
      try {
        await this.$axios.post(`/users/register/${token}`, {
          pseudo: this.pseudo,
          email: this.email,
          password: this.password
        });
        this.$router.push('/login');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          this.error = error.response.data.message;
        } else {
          this.error = 'Registration failed. Please try again.';
        }
      }
    }
  }
}
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: auto;
  height: 100vh;
  display: flex;
  align-items: center;
}

.registerContent {
  background-color: var(--couleurSecondaire-3);
  padding: 40px 20px;
  border-radius: 20px;
  width: 100%;
}

.registerContent h1 {
  text-align: center;
  font-family: var(--policeTitre);
  font-size: var(--tailleTitre);
  color: var(--couleurSecondaire-1);
  font-weight: bold;
  padding-bottom: 10px;
}

.registerContent h2 {
  text-align: center;
  font-family: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  color: var(--couleurSecondaire-1);
  font-style: italic;
}

.formInputs label {
  display: block;
  font-style: var(--policeTitre);
  font-size: var(--tailleSousTitre);
  color: var(--couleurSecondaire-1);
  font-weight: bold;
  padding-bottom: 10px;
}

.formRegister p {
  font-size: var(--tailleSpan);
  font-weight: lighter;
  padding-top: 5px;
}

.erreur {
  color: var(--couleurErreur);
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

.loginBottom {
  padding-top: 60px;
}

.loginBottom p{
  text-align: center;
  font-size: var(--tailleContenu);
  color: var(--couleurSecondaire-1);
  font-weight: lighter;
}

.loginLink {
  display: block;
  text-align: center;
  font-size: var(--tailleSousTitre);
  font-weight: lighter;
  font-style: italic;
  color: var(--couleurPrincipale-2);
}
</style>
