import { AuthProvider } from '../../context/AuthContext';

function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default AppProviders;