export default function ({ store, redirect, route }) {
  const isAuthenticated = !!store.state.token;
  const userRole = store.state.userRole;

  if (!isAuthenticated && (route.name !== 'login' && route.name !== 'register' && route.name !== 'register-token')) {
    return redirect('/login');
  }

  if (isAuthenticated && route.name === 'login') {
    if (userRole === 'admin') {
      return redirect('/adminDashboard');
    } else if (userRole === 'utilisateur') {
      return redirect('/profile');
    } else if (userRole === 'banni') {
      return redirect('/bannissement');
    }
  }

  if (isAuthenticated && route.name === 'register') {
    return redirect('/');
  }

  if (route.name.startsWith('admin') && userRole !== 'admin') {
    return redirect('/profile');
  }

  if (route.name === 'profile' && userRole === 'banni') {
    return redirect('/bannissement');
  }
}
