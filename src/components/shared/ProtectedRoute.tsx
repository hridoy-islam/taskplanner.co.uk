import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, allowedRoles}) => {
  const user = useSelector((state: any) => state.auth.user); // Get user from Redux state

  if (!user) {
    // If there's no user, redirect to the login page
    return <Navigate to="/login" replace />;
  }


  if (!user.isValided) {
    return <Navigate to="/not-verified" replace />;
  }

  if (!user.authorized) {
    return <Navigate to="/personal-details" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }


  return children; 
};

export default ProtectedRoute;


