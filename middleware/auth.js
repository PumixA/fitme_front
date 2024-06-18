export default function ({ store, redirect, route }) {
  const isAuthenticated = !!store.state.token;

  if (!isAuthenticated && (route.name === 'index' || route.name === 'profile')) {
    return redirect('/login');
  }

  if (isAuthenticated && (route.name === 'login' || route.name === 'register')) {
    return redirect('/profile');
  }
}
