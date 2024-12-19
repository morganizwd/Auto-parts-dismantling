// src/pages/client/CartPage.jsx

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    Container,
    Table,
    Button,
    Form,
    Alert,
    Row,
    Col,
} from 'react-bootstrap';
import { HeartFill } from 'react-bootstrap-icons';
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal, clearCart } from '../../redux/slices/cartSlice';
import axios from '../../redux/axios';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);

    const [orderStatus, setOrderStatus] = useState('idle');
    const [orderError, setOrderError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [deliveryMethod, setDeliveryMethod] = useState('courier');
    const [address, setAddress] = useState(''); // поле для адреса

    const handleRemove = (partId) => {
        dispatch(removeFromCart(partId));
    };

    const handleQuantityChange = (partId, quantity) => {
        if (quantity < 1) return;
        dispatch(updateQuantity({ partId, quantity }));
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        setOrderStatus('submitting');
        setOrderError(null);
        setOrderSuccess(null);

        try {
            const items = cartItems.map(item => ({
                part_id: item.part.id,
                quantity: item.quantity,
            }));

            const payload = {
                delivery_method: deliveryMethod,
                items,
            };

            // Если способ доставки courier, добавляем address
            if (deliveryMethod === 'courier') {
                payload.address = address.trim();
            }

            const response = await axios.post('/orders', payload);

            setOrderStatus('succeeded');
            setOrderSuccess('Заказ успешно создан!');
            dispatch(clearCart());
            setAddress('');
        } catch (err) {
            setOrderStatus('failed');
            setOrderError(
                err.response?.data?.message || 'Ошибка при создании заказа'
            );
        }
    };

    return (
        <Container className="mt-5">
            <h2>Моя Корзина</h2>
            <hr className="my-4" />

            {cartItems.length === 0 ? (
                <Alert variant="info">Ваша корзина пуста.</Alert>
            ) : (
                <>
                    {orderError && <Alert variant="danger">{orderError}</Alert>}
                    {orderSuccess && <Alert variant="success">{orderSuccess}</Alert>}

                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Цена за шт.</th>
                                <th>Количество</th>
                                <th>Итого</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((item) => (
                                <tr key={item.part.id}>
                                    <td>
                                        <Link to={`/parts/${item.part.id}`}>
                                            {item.part.name}
                                        </Link>
                                    </td>
                                    <td>
                                        {parseFloat(item.part.price).toLocaleString()} ₽
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(
                                                    item.part.id,
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            style={{ width: '80px' }}
                                        />
                                    </td>
                                    <td>
                                        {(item.part.price * item.quantity).toLocaleString()} ₽
                                    </td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleRemove(item.part.id)}
                                        >
                                            <HeartFill /> Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Group controlId="deliveryMethod">
                                <Form.Label>Способ доставки</Form.Label>
                                <Form.Select
                                    value={deliveryMethod}
                                    onChange={(e) => setDeliveryMethod(e.target.value)}
                                >
                                    <option value="courier">Курьер</option>
                                    <option value="pickup">Самовывоз</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {deliveryMethod === 'courier' && (
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="address">
                                    <Form.Label>Адрес доставки</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Введите адрес доставки"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    <Row className="justify-content-end">
                        <Col md={4}>
                            <h4>Общая стоимость: {cartTotal.toLocaleString()} ₽</h4>
                            <Button
                                variant="success"
                                onClick={handleCheckout}
                                disabled={orderStatus === 'submitting'}
                            >
                                {orderStatus === 'submitting' ? 'Оформление...' : 'Оформить заказ'}
                            </Button>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default CartPage;
