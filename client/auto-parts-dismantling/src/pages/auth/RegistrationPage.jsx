// src/pages/RegistrationPage.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, selectUserStatus, selectUserError, selectIsAuth } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const RegistrationPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const status = useSelector(selectUserStatus);
    const error = useSelector(selectUserError);
    const isAuth = useSelector(selectIsAuth);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'client', 
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isAuth) {
            navigate('/'); 
        }
    }, [isAuth, navigate]);

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
        if (!formData.password) {
            errors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            errors.password = 'Пароль должен содержать минимум 6 символов';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
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
        if (Object.keys(errors).length === 0) {
            dispatch(register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            }));
        }
    };

    return (
        <div className="container mt-5">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Имя пользователя</label>
                    <input
                        type="text"
                        className={`form-control ${formErrors.username ? 'is-invalid' : ''}`}
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Пароль</label>
                    <input
                        type="password"
                        className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {formErrors.password && <div className="invalid-feedback">{formErrors.password}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Подтвердите пароль</label>
                    <input
                        type="password"
                        className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    {formErrors.confirmPassword && <div className="invalid-feedback">{formErrors.confirmPassword}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="role" className="form-label">Роль</label>
                    <select
                        className="form-select"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="client">Клиент</option>
                        <option value="operator">Оператор склада</option>
                    </select>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
        </div>
    );
};

export default RegistrationPage;
