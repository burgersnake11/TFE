import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios.get("http://studio-eventail.be:3001/getcookie", { withCredentials: true })
      .then(res => {
        setIsLoggedIn(true);
      })
      .catch(error => {
        setIsLoggedIn(false);
        navigate('/login'); // Rediriger ici en cas d'échec d'authentification
      });
  }, []);

  if (!isLoggedIn) {
    return null; // Vous n'avez pas besoin de faire "navigate('/login')" ici
  }

  return <Outlet />;
};

export default ProtectedRoute;
