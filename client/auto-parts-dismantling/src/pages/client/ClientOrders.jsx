// src/pages/client/ClientOrders.jsx

import React, { useEffect, useState } from 'react';
import axios from '../../redux/axios';
import { Container, Row, Col, Table, Alert, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/userSlice';

const ClientOrders = () => {
    const currentUser = useSelector(selectCurrentUser);
    const [orders, setOrders] = useState([]);
    const [ordersStatus, setOrdersStatus] = useState('idle');
    const [ordersError, setOrdersError] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [reviewsStatus, setReviewsStatus] = useState('idle');
    const [reviewsError, setReviewsError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setOrdersStatus('loading');
            setOrdersError(null);
            try {
                const response = await axios.get('/orders');
                setOrders(response.data.orders);
                setOrdersStatus('succeeded');
            } catch (err) {
                setOrdersStatus('failed');
                setOrdersError(
                    err.response?.data?.message || 'Ошибка при загрузке заказов'
                );
            }
        };

        const fetchReviews = async () => {
            setReviewsStatus('loading');
            setReviewsError(null);
            try {
                const response = await axios.get('/reviews');
                setReviews(response.data.reviews);
                setReviewsStatus('succeeded');
            } catch (err) {
                setReviewsStatus('failed');
                setReviewsError(
                    err.response?.data?.message || 'Ошибка при загрузке отзывов'
                );
            }
        };

        if (currentUser && currentUser.role === 'client') {
            fetchOrders();
            fetchReviews();
        }
    }, [currentUser]);

    return (
        <Container className="mt-5">
            <h2>Мои заказы и отзывы</h2>
            <hr className="my-4" />

            <Row>
                <Col md={12}>
                    <h3>Мои заказы</h3>
                    {ordersStatus === 'loading' && <Alert variant="info">Загрузка заказов...</Alert>}
                    {ordersStatus === 'failed' && <Alert variant="danger">{ordersError}</Alert>}
                    {ordersStatus === 'succeeded' && orders.length === 0 && (
                        <Alert variant="info">У вас еще нет заказов.</Alert>
                    )}
                    {ordersStatus === 'succeeded' && orders.length > 0 && (
                        <Table striped bordered hover responsive className="mb-5">
                            <thead>
                                <tr>
                                    <th>ID заказа</th>
                                    <th>Статус</th>
                                    <th>Способ доставки</th>
                                    <th>Адрес</th>
                                    <th>Общая стоимость</th>
                                    <th>Товары</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.id}</td>
                                        <td>{order.status}</td>
                                        <td>{order.delivery_method}</td>
                                        <td>{order.address || 'N/A'}</td>
                                        <td>{parseFloat(order.total_price).toLocaleString()} ₽</td>
                                        <td>
                                            {order.OrderItems && order.OrderItems.length > 0 ? (
                                                order.OrderItems.map(item => (
                                                    <div key={item.id}>
                                                        {item.Part.name} x {item.quantity} = {parseFloat(item.price * item.quantity).toLocaleString()} ₽
                                                    </div>
                                                ))
                                            ) : (
                                                <span>Нет товаров</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={12}>
                    <h3>Мои отзывы</h3>
                    {reviewsStatus === 'loading' && <Alert variant="info">Загрузка отзывов...</Alert>}
                    {reviewsStatus === 'failed' && <Alert variant="danger">{reviewsError}</Alert>}
                    {reviewsStatus === 'succeeded' && reviews.length === 0 && (
                        <Alert variant="info">У вас еще нет отзывов.</Alert>
                    )}
                    {reviewsStatus === 'succeeded' && reviews.length > 0 && (
                        reviews.map(review => (
                            <Card key={review.id} className="mb-3">
                                <Card.Body>
                                    <Card.Title>Рейтинг: {review.rating}/5</Card.Title>
                                    <Card.Text>{review.comment || 'Без комментария'}</Card.Text>
                                    <Card.Footer>
                                        Дата: {new Date(review.createdAt).toLocaleDateString()}
                                        <br />
                                        Товар: {review.Part ? review.Part.name : 'N/A'}
                                    </Card.Footer>
                                </Card.Body>
                            </Card>
                        ))
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default ClientOrders;
