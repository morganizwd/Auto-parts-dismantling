// src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, selectUserStatus, selectUserError, selectIsAuth } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const status = useSelector(selectUserStatus);
    const error = useSelector(selectUserError);
    const isAuth = useSelector(selectIsAuth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isAuth) {
            navigate('/'); 
        }
    }, [isAuth, navigate]);

    const validate = () => {
        const errors = {};
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
            dispatch(login({
                email: formData.email,
                password: formData.password,
            }));
        }
    };

    return (
        <div className="container mt-5">
            <h2>Вход</h2>
            <form onSubmit={handleSubmit} className="mt-4">
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

                {error && <div className="alert alert-danger">{error}</div>}

                <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
