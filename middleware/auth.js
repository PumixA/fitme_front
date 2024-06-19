export default function ({ store, redirect, route }) {
  const isAuthenticated = !!store.state.token;
  const userRole = store.state.userRole; // Assurez-vous que le rôle de l'utilisateur est stocké dans le store

  if (!isAuthenticated && (route.name === 'index' || route.name === 'profile' || route.name === 'adminProfile')) {
    return redirect('/login');
  }

  if (isAuthenticated && route.name === 'login') {
    if (userRole === 'admin') {
      return redirect('/adminProfile');
    } else if (userRole === 'utilisateur') {
      return redirect('/profile');
    }
  }

  if (isAuthenticated && route.name === 'register') {
    return redirect('/');
  }

  if (route.name === 'profile' && userRole !== 'utilisateur') {
    return redirect('/');
  }

  if (route.name === 'adminProfile' && userRole !== 'admin') {
    return redirect('/');
  }
}
