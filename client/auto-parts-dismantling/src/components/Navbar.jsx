// src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuth, logout, selectCurrentUser } from '../redux/slices/userSlice';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { selectCartItems } from '../redux/slices/cartSlice';
import { selectAllFavorites } from '../redux/slices/favoriteSlice';

const Navbar = () => {
    const isAuth = useSelector(selectIsAuth);
    const currentUser = useSelector(selectCurrentUser);
    const cartItems = useSelector(selectCartItems);
    const favorites = useSelector(selectAllFavorites);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const favoriteCount = favorites.length;

    return (
        <BootstrapNavbar bg="light" expand="lg">
            <Container>
                <BootstrapNavbar.Brand as={Link} to="/">Auto Parts</BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
                <BootstrapNavbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {isAuth ? (
                            <>
                                <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>
                                {currentUser.role === 'client' && (
                                    <>
                                        <Nav.Link as={Link} to="/my-orders">Мои заказы и отзывы</Nav.Link>
                                        <Nav.Link as={Link} to="/cart">
                                            Корзина {cartCount > 0 && <Badge bg="secondary">{cartCount}</Badge>}
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/favorites">
                                            Избранное {favoriteCount > 0 && <Badge bg="secondary">{favoriteCount}</Badge>}
                                        </Nav.Link>
                                    </>
                                )}
                                {currentUser.role === 'operator' && (
                                    <>
                                        <Nav.Link as={Link} to="/suppliers">Поставщики</Nav.Link>
                                        <Nav.Link as={Link} to="/parts">Запчасти</Nav.Link>
                                        <Nav.Link as={Link} to="/inventory">Инвентарь</Nav.Link>
                                        <Nav.Link as={Link} to="/ordersmanagment">Заказы</Nav.Link>
                                    </>
                                )}
                                <Button variant="outline-secondary" className="ms-2" onClick={handleLogout}>
                                    Выйти
                                </Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
                            </>
                        )}
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;
