// src/pages/UserProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    selectCurrentUser, 
    selectUserStatus, 
    selectUserError, 
    fetchCurrentUser, 
    updateUser, 
    logout 
} from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';

const UserProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentUser = useSelector(selectCurrentUser);
    const status = useSelector(selectUserStatus);
    const error = useSelector(selectUserError);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!currentUser) {
            dispatch(fetchCurrentUser());
        } else {
            console.log('Текущий пользователь:', currentUser); 
            setFormData({
                username: currentUser.username,
                email: currentUser.email,
                password: '',
                confirmPassword: '',
            });
        }
    }, [currentUser, dispatch]);

    useEffect(() => {
        if (status === 'succeeded' && !error) {
            console.log('Обновление прошло успешно'); 
            setSuccessMessage('Профиль успешно обновлён.');
            setFormData((prevData) => ({
                ...prevData,
                password: '',
                confirmPassword: '',
            }));
        }
    }, [status, error]);

    const validate = () => {
        const errors = {};
        if (!formData.username.trim()) errors.username = 'Имя пользователя обязательно';
        if (!formData.email.trim()) {
            errors.email = 'Email обязателен';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Некорректный формат email';
            }
        }
        if (formData.password) {
            if (formData.password.length < 6) {
                errors.password = 'Пароль должен содержать минимум 6 символов';
            }
            if (formData.password !== formData.confirmPassword) {
                errors.confirmPassword = 'Пароли не совпадают';
            }
        }
        return errors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate();
        setFormErrors(errors);
        setSuccessMessage('');
        if (Object.keys(errors).length === 0) {
            const updatedData = {
                username: formData.username,
                email: formData.email,
            };
            if (formData.password) {
                updatedData.password = formData.password;
            }
            dispatch(updateUser(updatedData));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    if (status === 'loading' && !currentUser) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h2>Профиль пользователя</h2>
            <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group controlId="username" className="mb-3">
                    <Form.Label>Имя пользователя</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        isInvalid={!!formErrors.username}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formErrors.username}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!formErrors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                        {formErrors.email}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="password" className="mb-3">
                    <Form.Label>Новый пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!formErrors.password}
                        placeholder="Оставьте пустым, если не хотите менять пароль"
                    />
                    <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-3">
                    <Form.Label>Подтвердите новый пароль</Form.Label>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.confirmPassword}
                        placeholder="Оставьте пустым, если не хотите менять пароль"
                    />
                    <Form.Control.Feedback type="invalid">
                        {formErrors.confirmPassword}
                    </Form.Control.Feedback>
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}

                <Button variant="primary" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>

                <Button variant="secondary" className="ms-3" onClick={handleLogout}>
                    Выйти из аккаунта
                </Button>
            </Form>
        </Container>
    );
};

export default UserProfilePage;
