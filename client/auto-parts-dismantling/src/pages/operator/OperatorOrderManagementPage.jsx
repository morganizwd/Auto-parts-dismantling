// src/pages/operator/OperatorOrderManagementPage.jsx

import React, { useEffect, useState } from 'react';
import axios from '../../redux/axios';
import {
    Container,
    Table,
    Spinner,
    Alert,
    Form,
    Row,
    Col,
    Button,
    Pagination,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/userSlice';

const OperatorOrderManagementPage = () => {
    const currentUser = useSelector(selectCurrentUser);

    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState('idle'); // idle | loading | succeeded | failed
    const [error, setError] = useState(null);

    // Фильтры и пагинация
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const validStatuses = ['pending', 'completed', 'cancelled'];

    useEffect(() => {
        const fetchOrders = async () => {
            setStatus('loading');
            setError(null);
            try {
                const params = {
                    page: currentPage,
                    limit,
                };
                if (filterStatus) {
                    params.status = filterStatus;
                }

                const response = await axios.get('/orders', { params });
                setOrders(response.data.orders);
                setTotalPages(response.data.pages || 1);
                setStatus('succeeded');
            } catch (err) {
                setStatus('failed');
                setError(
                    err.response?.data?.message || 'Ошибка при загрузке заказов'
                );
            }
        };

        // Загрузка заказов
        if (currentUser && currentUser.role === 'operator') {
            fetchOrders();
        }
    }, [currentUser, filterStatus, currentPage, limit]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            // После успешного обновления перезагружаем заказы
            const params = {
                page: currentPage,
                limit,
            };
            if (filterStatus) {
                params.status = filterStatus;
            }
            const response = await axios.get('/orders', { params });
            setOrders(response.data.orders);
        } catch (err) {
            alert(err.response?.data?.message || 'Ошибка при обновлении статуса');
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
            <h2>Управление заказами</h2>
            <hr className="my-4" />

            {/* Фильтр по статусу */}
            <Form className="mb-4">
                <Row className="g-3">
                    <Col md={3}>
                        <Form.Group controlId="filterStatus">
                            <Form.Label>Статус заказа</Form.Label>
                            <Form.Select
                                value={filterStatus}
                                onChange={(e) => {
                                    setCurrentPage(1);
                                    setFilterStatus(e.target.value);
                                }}
                            >
                                <option value="">Все</option>
                                <option value="pending">Ожидается</option>
                                <option value="completed">Выполнен</option>
                                <option value="cancelled">Отменён</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            {status === 'loading' ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : status === 'failed' ? (
                <Alert variant="danger">{error}</Alert>
            ) : orders.length > 0 ? (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID Заказа</th>
                                <th>Пользователь (Email / Username)</th>
                                <th>Статус</th>
                                <th>Способ доставки</th>
                                <th>Адрес</th>
                                <th>Общая стоимость</th>
                                <th>Товары</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>
                                        {order.User
                                            ? `${order.User.email} / ${order.User.username}`
                                            : 'Неизвестно'}
                                    </td>
                                    <td>{order.status}</td>
                                    <td>{order.delivery_method}</td>
                                    <td>{order.address || 'N/A'}</td>
                                    <td>
                                        {parseFloat(order.total_price).toLocaleString()} ₽
                                    </td>
                                    <td>
                                        {order.OrderItems && order.OrderItems.length > 0 ? (
                                            order.OrderItems.map((item) => (
                                                <div key={item.id}>
                                                    {item.Part.name} x {item.quantity} ={' '}
                                                    {(parseFloat(item.price) * item.quantity).toLocaleString()} ₽
                                                </div>
                                            ))
                                        ) : (
                                            <span>Нет товаров</span>
                                        )}
                                    </td>
                                    <td>
                                        <Form.Select
                                            value={order.status}
                                            onChange={(e) =>
                                                handleStatusChange(order.id, e.target.value)
                                            }
                                        >
                                            {validStatuses.map((st) => (
                                                <option key={st} value={st}>
                                                    {st}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            ) : (
                <Alert variant="info">Заказы не найдены.</Alert>
            )}
        </Container>
    );
};

export default OperatorOrderManagementPage;
