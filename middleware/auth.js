export default function ({ store, redirect, route }) {
  const isAuthenticated = !!store.state.token;
  const userRole = store.state.userRole;
  const tokenExpiration = store.state.tokenExpiration;

  // Vérifiez si le token est expiré
  if (tokenExpiration && Date.now() > tokenExpiration) {
    store.dispatch('logout');
    return redirect('/login');
  }

  if (!isAuthenticated && !['login', 'register', 'register-token'].includes(route.name)) {
    return redirect('/login');
  }

  if (isAuthenticated && route.name === 'login') {
    if (userRole === 'admin') {
      return redirect('/admin/adminDashboard');
    } else if (userRole === 'utilisateur') {
      return redirect('/utilisateur/dashboard');
    } else if (userRole === 'banni') {
      return redirect('/bannissement');
    } else {
      store.dispatch('logout');
      return redirect('/login');
    }
  }

  if (isAuthenticated && route.name === 'register') {
    return redirect('/');
  }

  if (route.name && route.name.startsWith('admin') && userRole !== 'admin') {
    return redirect('/utilisateur/dashboard');
  }

  if (route.name && route.name.startsWith('utilisateur') && userRole !== 'utilisateur') {
    return redirect('/admin/adminDashboard');
  }

  if (route.name === 'profile' && userRole === 'banni') {
    return redirect('/bannissement');
  }
}
