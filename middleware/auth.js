export default function ({ store, redirect, route }) {
  const isAuthenticated = !!store.state.token;
  const userRole = store.state.userRole;

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
      store.commit('logout');
      return redirect('/login');
    }
  }

  if (isAuthenticated && route.name === 'register') {
    return redirect('/');
  }

  if (route.name && route.name.startsWith('admin') && userRole !== 'admin') {
    return redirect('/utilisateur/dashboard');
  }

  if (route.name === 'profile' && userRole === 'banni') {
    return redirect('/bannissement');
  }
}
