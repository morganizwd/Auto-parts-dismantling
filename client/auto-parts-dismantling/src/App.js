// src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './redux/store';
import 'bootstrap/dist/css/bootstrap.min.css';

import RegistrationPage from './pages/auth/RegistrationPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/client/HomePage';
import UserProfilePage from './pages/UserProfilePage';
import SupplierManagementPage from './pages/operator/SupplierManagementPage';
import PartManagementPage from './pages/operator/PartManagementPage';
import InventoryManagementPage from './pages/operator/InventoryManagementPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { fetchCurrentUser } from './redux/slices/userSlice';
import ProductDetailPage from './pages/client/ProductDetailPage';
import CartPage from './pages/client/CartPage';
import FavoritesPage from './pages/client/FavoritesPage';
import ClientOrders from './pages/client/ClientOrders';
import OperatorOrderManagementPage from './pages/operator/OperatorOrderManagementPage';
import Footer from './components/Footer';

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Маршрут для страницы деталей продукта */}
        <Route path="/parts/:id" element={<ProductDetailPage />} />

        {/* Маршруты для корзины и избранного */}
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <CartPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          }
        />

        {/* Страница с заказами и отзывами для клиента */}
        <Route
          path="/my-orders"
          element={
            <PrivateRoute requiredRole="client">
              <ClientOrders />
            </PrivateRoute>
          }
        />

        {/* Защищённые маршруты для операторов */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <PrivateRoute requiredRole="operator">
              <SupplierManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/parts"
          element={
            <PrivateRoute requiredRole="operator">
              <PartManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute requiredRole="operator">
              <InventoryManagementPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ordersmanagment"
          element={
            <PrivateRoute requiredRole="operator">
              <OperatorOrderManagementPage />
            </PrivateRoute>
          }
        />
      </Routes>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
