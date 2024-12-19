// src/components/PrivateRoute.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuth } from '../redux/slices/userSlice';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuth = useSelector(selectIsAuth);
    return isAuth ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
