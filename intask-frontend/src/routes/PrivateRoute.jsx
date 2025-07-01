import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return user ? children : (
  <div className="text-center mt-10 text-xl text-gray-700">
    🔒 You must be logged in to access this page.
  </div>
);

};

export default PrivateRoute;
