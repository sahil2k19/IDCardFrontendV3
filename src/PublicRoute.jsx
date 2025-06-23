import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ element: Component }) => {
  const token = localStorage.getItem('token');

  // If token exists, redirect to /event
  if (token) {
    return <Navigate to="/event" replace />;
  }

  // If not authenticated, allow access to public route (like login)
  return Component;
};

export default PublicRoute;