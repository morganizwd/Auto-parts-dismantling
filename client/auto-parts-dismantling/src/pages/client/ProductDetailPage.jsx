// src/pages/client/ProductDetailPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    Form,
} from 'react-bootstrap';
import { HeartFill, Heart } from 'react-bootstrap-icons'; 
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/userSlice';
import { addToCart } from '../../redux/slices/cartSlice'; 

const ProductDetailPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const currentUser = useSelector(selectCurrentUser);
    const isAuthenticated = !!currentUser;
    const userRole = currentUser?.role || null;
    const userId = currentUser?.id || null;

    const [part, setPart] = useState(null);
    const [status, setStatus] = useState('idle'); 
    const [error, setError] = useState(null);

    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [reviewStatus, setReviewStatus] = useState('idle'); 
    const [reviewError, setReviewError] = useState(null);
    const [hasReviewed, setHasReviewed] = useState(false); 

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteStatus, setFavoriteStatus] = useState('idle');
    const [favoriteError, setFavoriteError] = useState(null);

    const [quantity, setQuantity] = useState(1);
    const [cartStatus, setCartStatus] = useState('idle'); 
    const [cartError, setCartError] = useState(null);
    const [cartSuccess, setCartSuccess] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
            } catch (e) {
                console.error('Invalid token:', e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchPart = async () => {
            setStatus('loading');
            setError(null);
            try {
                const response = await axios.get(`/parts/${id}`);
                setPart(response.data.part);
                setStatus('succeeded');
    
                if (isAuthenticated && userRole === 'client') {
                    const reviewsResponse = await axios.get('/reviews', {
                        params: { part_id: id },
                    });
                    const userReviews = reviewsResponse.data.reviews.filter(
                        (review) => review.user_id === userId
                    );
                    if (userReviews.length > 0) {
                        setHasReviewed(true);
                    }
                }
    
                if (isAuthenticated && userRole === 'client') {
                    const favoritesResponse = await axios.get('/favorites', {
                        params: { part_id: id }, 
                    });
                    if (favoritesResponse.data.favorites.length > 0) {
                        setIsFavorite(true);
                    } else {
                        setIsFavorite(false); 
                    }
                }
            } catch (err) {
                setStatus('failed');
                setError(
                    err.response?.data?.message ||
                    'Ошибка при загрузке информации о запчасти'
                );
            }
        };
    
        fetchPart();
    }, [id, isAuthenticated, userRole, userId]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleFavoriteToggle = async () => {
        if (!isAuthenticated || userRole !== 'client') {
            setFavoriteError('Пожалуйста, войдите в систему, чтобы управлять избранным.');
            return;
        }

        if (isFavorite) {
            setFavoriteStatus('removing');
            setFavoriteError(null);
            try {
                await axios.delete(`/favorites/${id}`);
                setIsFavorite(false);
                setFavoriteStatus('succeeded');
            } catch (err) {
                setFavoriteStatus('failed');
                setFavoriteError(
                    err.response?.data?.message || 'Ошибка при удалении из избранного'
                );
            }
        } else {
            setFavoriteStatus('adding');
            setFavoriteError(null);
            try {
                await axios.post('/favorites', { part_id: id });
                setIsFavorite(true);
                setFavoriteStatus('succeeded');
            } catch (err) {
                setFavoriteStatus('failed');
                setFavoriteError(
                    err.response?.data?.message || 'Ошибка при добавлении в избранное'
                );
            }
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewStatus('submitting');
        setReviewError(null);

        try {
            const payload = {
                part_id: id,
                rating: newRating,
                comment: newComment,
            };
            await axios.post('/reviews', payload);
            const updatedPartResponse = await axios.get(`/parts/${id}`);
            setPart(updatedPartResponse.data.part);
            setReviewStatus('succeeded');
            setNewRating(5);
            setNewComment('');
            setHasReviewed(true);
        } catch (err) {
            setReviewStatus('failed');
            setReviewError(
                err.response?.data?.message || 'Ошибка при отправке отзыва'
            );
        }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated || userRole !== 'client') {
            setCartError('Пожалуйста, войдите в систему, чтобы добавить товары в корзину.');
            return;
        }

        if (quantity < 1) {
            setCartError('Количество должно быть не менее 1.');
            return;
        }

        setCartStatus('adding');
        setCartError(null);
        setCartSuccess(null);

        try {
            dispatch(addToCart({ part, quantity }));
            setCartStatus('succeeded');
            setCartSuccess('Запчасть успешно добавлена в корзину.');
            setQuantity(1);
        } catch (err) {
            setCartStatus('failed');
            setCartError('Ошибка при добавлении в корзину.');
        }
    };

    return (
        <Container className="mt-5">
            <Button variant="secondary" onClick={handleBack} className="mb-4">
                Назад
            </Button>

            {status === 'loading' ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : status === 'failed' ? (
                <Alert variant="danger">{error}</Alert>
            ) : part ? (
                <Card>
                    <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
                        {part.name}
                        {isAuthenticated && userRole === 'client' && (
                            <Button
                                variant="link"
                                onClick={handleFavoriteToggle}
                                disabled={favoriteStatus === 'adding' || favoriteStatus === 'removing'}
                                style={{ color: 'red', textDecoration: 'none' }}
                            >
                                {isFavorite ? <HeartFill size={24} /> : <Heart size={24} />}
                            </Button>
                        )}
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Table bordered>
                                    <tbody>
                                        <tr>
                                            <th>Название</th>
                                            <td>{part.name}</td>
                                        </tr>
                                        <tr>
                                            <th>Описание</th>
                                            <td>{part.description || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <th>Цена</th>
                                            <td>
                                                {parseFloat(part.price).toLocaleString()} ₽
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Совместимость</th>
                                            <td>
                                                {part.compatibility &&
                                                    typeof part.compatibility === 'object' ? (
                                                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                                                        {JSON.stringify(
                                                            part.compatibility,
                                                            null,
                                                            2
                                                        )}
                                                    </pre>
                                                ) : (
                                                    part.compatibility || 'N/A'
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Запас</th>
                                            <td>{part.stock}</td>
                                        </tr>
                                        {part.supplier && (
                                            <>
                                                <tr>
                                                    <th>Поставщик</th>
                                                    <td>
                                                        <Link
                                                            to={`/suppliers/${part.supplier.id}`}
                                                        >
                                                            {part.supplier.name}
                                                        </Link>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Рейтинг поставщика</th>
                                                    <td>
                                                        {part.supplier.rating || 'N/A'}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Контактная информация</th>
                                                    <td>
                                                        {part.supplier.contact_info ||
                                                            'N/A'}
                                                    </td>
                                                </tr>
                                            </>
                                        )}
                                        {part.inventory && part.inventory.length > 0 && (
                                            <tr>
                                                <th>Склады</th>
                                                <td>
                                                    {part.inventory.map((inv) => (
                                                        <div key={inv.id}>
                                                            {inv.location}: {inv.quantity} шт.
                                                        </div>
                                                    ))}
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <th>Средний рейтинг</th>
                                            <td>
                                                {part.averageRating
                                                    ? parseFloat(part.averageRating).toFixed(
                                                        2
                                                    )
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Количество отзывов</th>
                                            <td>{part.reviewsCount || 0}</td>
                                        </tr>
                                    </tbody>
                                </Table>

                                {isAuthenticated && userRole === 'client' && (
                                    <>
                                        <Form.Group controlId="quantity" className="mb-3">
                                            <Form.Label>Количество</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                placeholder="Введите количество"
                                            />
                                        </Form.Group>
                                        <Button
                                            variant="primary"
                                            onClick={handleAddToCart}
                                            disabled={cartStatus === 'adding'}
                                        >
                                            {cartStatus === 'adding' ? 'Добавление...' : 'Добавить в корзину'}
                                        </Button>
                                        {cartError && (
                                            <Alert variant="danger" className="mt-3">
                                                {cartError}
                                            </Alert>
                                        )}
                                        {cartSuccess && (
                                            <Alert variant="success" className="mt-3">
                                                {cartSuccess}
                                            </Alert>
                                        )}
                                    </>
                                )}
                            </Col>
                            <Col md={6}>
                   
                                <h5>Отзывы</h5>
                                {part.Reviews && part.Reviews.length > 0 ? (
                                    part.Reviews.map((review) => (
                                        <Card key={review.id} className="mb-3">
                                            <Card.Body>
                                                <Card.Title>
                                                    Рейтинг: {review.rating}/5
                                                </Card.Title>
                                                <Card.Text>
                                                    {review.comment || 'Без комментария'}
                                                </Card.Text>
                                                <Card.Footer>
                                                    {new Date(
                                                        review.createdAt
                                                    ).toLocaleDateString()}{' '}
                                                    {review.User && (
                                                        <span>
                                                            -{' '}
                                                            <Link
                                                                to={`/users/${review.User.id}`}
                                                            >
                                                                {review.User.username}
                                                            </Link>
                                                        </span>
                                                    )}
                                                </Card.Footer>
                                            </Card.Body>
                                        </Card>
                                    ))
                                ) : (
                                    <p>Нет отзывов.</p>
                                )}

                                <hr />

                                {isAuthenticated && userRole === 'client' ? (
                                    hasReviewed ? (
                                        <Alert variant="info">
                                            Вы уже оставили отзыв для этой запчасти.
                                        </Alert>
                                    ) : (
                                        <Form onSubmit={handleReviewSubmit}>
                                            <h5>Оставить отзыв</h5>
                                            {reviewStatus === 'failed' && (
                                                <Alert variant="danger">
                                                    {reviewError}
                                                </Alert>
                                            )}
                                            {reviewStatus === 'succeeded' && (
                                                <Alert variant="success">
                                                    Ваш отзыв успешно отправлен!
                                                </Alert>
                                            )}
                                            <Form.Group controlId="rating" className="mb-3">
                                                <Form.Label>Рейтинг</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={newRating}
                                                    onChange={(e) =>
                                                        setNewRating(
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    required
                                                >
                                                    <option value="">Выберите рейтинг</option>
                                                    <option value="1">1 - Очень плохо</option>
                                                    <option value="2">2 - Плохо</option>
                                                    <option value="3">3 - Нормально</option>
                                                    <option value="4">4 - Хорошо</option>
                                                    <option value="5">5 - Отлично</option>
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group controlId="comment" className="mb-3">
                                                <Form.Label>Комментарий</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Введите ваш комментарий"
                                                    value={newComment}
                                                    onChange={(e) =>
                                                        setNewComment(e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={reviewStatus === 'submitting'}
                                            >
                                                {reviewStatus === 'submitting'
                                                    ? 'Отправка...'
                                                    : 'Отправить отзыв'}
                                            </Button>
                                        </Form>
                                    )
                                ) : (
                                    <Alert variant="warning">
                                        Пожалуйста, <Link to="/login">войдите</Link> в систему, чтобы оставить отзыв.
                                    </Alert>
                                )}

                                {favoriteError && (
                                    <Alert variant="danger" className="mt-3">
                                        {favoriteError}
                                    </Alert>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <Alert variant="info">Запчасть не найдена.</Alert>
            )}
        </Container>
    );

};

export default ProductDetailPage;
