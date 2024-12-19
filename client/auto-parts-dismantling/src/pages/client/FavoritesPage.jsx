// src/pages/client/FavoritesPage.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../redux/axios';
import {
    Container,
    Row,
    Col,
    Card,
    Spinner,
    Alert,
    Button,
    Table,
    Pagination,
} from 'react-bootstrap';
import { HeartFill } from 'react-bootstrap-icons';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/userSlice';

const FavoritesPage = () => {
    const navigate = useNavigate();

    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = !!currentUser;
    const userRole = currentUser?.role || null;

    const [favorites, setFavorites] = useState([]);
    const [status, setStatus] = useState('idle'); 
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [removeError, setRemoveError] = useState(null);
    const [removeSuccess, setRemoveSuccess] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            setStatus('loading');
            setError(null);
            try {
                const response = await axios.get('/favorites', {
                    params: {
                        page: currentPage,
                        limit: limit,
                    },
                });
                setFavorites(response.data.favorites);
                setTotalPages(response.data.pages || 1);
                setStatus('succeeded');
            } catch (err) {
                setStatus('failed');
                setError(
                    err.response?.data?.message ||
                    'Ошибка при загрузке избранных запчастей'
                );
            }
        };

        fetchFavorites();
    }, [currentPage, limit]);

    const handleRemoveFavorite = async (partId) => {
        try {
            await axios.delete(`/favorites/${partId}`);
            setFavorites(favorites.filter((fav) => fav.part?.id !== partId));
            setRemoveSuccess('Запчасть успешно удалена из избранного.');
            setRemoveError(null);
        } catch (err) {
            setRemoveError(
                err.response?.data?.message ||
                'Ошибка при удалении из избранного'
            );
            setRemoveSuccess(null);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        return <Pagination>{items}</Pagination>;
    };

    return (
        <Container className="mt-5">
            <h2>Мои Избранные Запчасти</h2>
            <hr className="my-4" />

            {status === 'loading' ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : status === 'failed' ? (
                <Alert variant="danger">{error}</Alert>
            ) : favorites.length > 0 ? (
                <>
                    {removeError && <Alert variant="danger">{removeError}</Alert>}
                    {removeSuccess && <Alert variant="success">{removeSuccess}</Alert>}

                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Описание</th>
                                <th>Цена</th>
                                <th>Совместимость</th>
                                <th>Запас</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {favorites.map((favorite) => (
                                <tr key={favorite.id}>
                                    <td>
                                        {favorite.Part ? (
                                            <Link to={`/parts/${favorite.Part.id}`}>
                                                {favorite.Part.name}
                                            </Link>
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td>{favorite.Part?.description || 'N/A'}</td>
                                    <td>
                                        {favorite.Part
                                            ? parseFloat(favorite.Part.price).toLocaleString() + ' ₽'
                                            : 'N/A'}
                                    </td>
                                    <td>
                                        {favorite.Part?.compatibility &&
                                        typeof favorite.Part.compatibility === 'object' ? (
                                            <pre style={{ whiteSpace: 'pre-wrap' }}>
                                                {JSON.stringify(
                                                    favorite.Part.compatibility,
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        ) : (
                                            favorite.Part?.compatibility || 'N/A'
                                        )}
                                    </td>
                                    <td>{favorite.Part?.stock || 'N/A'}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() =>
                                                handleRemoveFavorite(favorite.Part?.id)
                                            }
                                        >
                                            <HeartFill /> Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            ) : (
                <Alert variant="info">У вас пока нет избранных запчастей.</Alert>
            )}
        </Container>
    );

};

export default FavoritesPage;
