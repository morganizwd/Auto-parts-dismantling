// src/pages/HomePage.jsx

import React, { useEffect, useState } from 'react';
import axios from '../../redux/axios';
import { Table, Container, Form, Row, Col, Button, Spinner, Alert, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [parts, setParts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [compatibility, setCompatibility] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Загрузка списка поставщиков
    const fetchSuppliers = async () => {
        try {
            const response = await axios.get('/suppliers');
            setSuppliers(response.data.suppliers || []);
        } catch (err) {
            console.error('Ошибка при загрузке поставщиков:', err);
        }
    };

    const fetchParts = async () => {
        setStatus('loading');
        setError(null);
        const params = {
            page: currentPage,
            limit: limit,
        };

        if (search.trim() !== '') params.search = search.trim();
        if (minPrice !== '') params.minPrice = minPrice;
        if (maxPrice !== '') params.maxPrice = maxPrice;
        if (supplierId !== '') params.supplier_id = supplierId;
        if (compatibility !== '') params.compatibility = compatibility;
        if (sortBy !== '') {
            params.sortBy = sortBy;
            params.sortOrder = sortOrder;
        }

        try {
            const response = await axios.get('/parts', { params });
            setParts(response.data.parts);
            setTotalPages(response.data.pages || 1);
            setStatus('succeeded');
        } catch (err) {
            setStatus('failed');
            setError(err.response?.data?.message || 'Ошибка при загрузке запчастей');
        }
    };

    useEffect(() => {
        fetchSuppliers();
        fetchParts();
    }, []);

    useEffect(() => {
        fetchParts();
    }, [currentPage, sortBy, sortOrder]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleMinPriceChange = (e) => {
        setMinPrice(e.target.value);
    };

    const handleMaxPriceChange = (e) => {
        setMaxPrice(e.target.value);
    };

    const handleSupplierChange = (e) => {
        setSupplierId(e.target.value);
    };

    const handleCompatibilityChange = (e) => {
        setCompatibility(e.target.value);
    };

    const handleSortByChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleSortOrderChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchParts();
    };

    const handleClearFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSupplierId('');
        setCompatibility('');
        setSortBy('');
        setSortOrder('ASC');
        setCurrentPage(1);
        fetchParts();
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                    {number}
                </Pagination.Item>,
            );
        }
        return <Pagination>{items}</Pagination>;
    };

    return (
        <Container className="mt-5">
            <h2>Каталог Запчастей</h2>
            <Form onSubmit={handleFilterSubmit} className="mt-4">
                <Row className="g-3">
                    <Col md={4}>
                        <Form.Group controlId="search">
                            <Form.Label>Поиск по названию</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите название запчасти"
                                value={search}
                                onChange={handleSearchChange}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="minPrice">
                            <Form.Label>Мин. цена</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={handleMinPriceChange}
                                min="0"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="maxPrice">
                            <Form.Label>Макс. цена</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="10000"
                                value={maxPrice}
                                onChange={handleMaxPriceChange}
                                min="0"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="supplier">
                            <Form.Label>Поставщик</Form.Label>
                            <Form.Select value={supplierId} onChange={handleSupplierChange}>
                                <option value="">Все</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="compatibility">
                            <Form.Label>Совместимость</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Введите совместимость"
                                value={compatibility}
                                onChange={handleCompatibilityChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-3 mt-3">
                    <Col md={3}>
                        <Form.Group controlId="sortBy">
                            <Form.Label>Сортировать по</Form.Label>
                            <Form.Select value={sortBy} onChange={handleSortByChange}>
                                <option value="">Без сортировки</option>
                                <option value="price">Цена</option>
                                <option value="name">Название</option>
                                <option value="createdAt">Дата добавления</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group controlId="sortOrder">
                            <Form.Label>Порядок</Form.Label>
                            <Form.Select value={sortOrder} onChange={handleSortOrderChange} disabled={sortBy === ''}>
                                <option value="ASC">По возрастанию</option>
                                <option value="DESC">По убыванию</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6} className="d-flex align-items-end">
                        <Button variant="primary" type="submit" className="me-2">
                            Применить фильтры
                        </Button>
                        <Button variant="secondary" onClick={handleClearFilters}>
                            Очистить фильтры
                        </Button>
                    </Col>
                </Row>
            </Form>

            <hr className="my-4" />

            {status === 'loading' ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Изображение</th>
                                <th>Название</th>
                                <th>Описание</th>
                                <th>Цена</th>
                                <th>Совместимость</th>
                                <th>Запас</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.length > 0 ? (
                                parts.map((part) => (
                                    <tr key={part.id}>
                                        <td>
                                            {part.image ? (
                                                <img
                                                    src={`http://localhost:5000/uploads/parts/${part.image}`}
                                                    alt={part.name}
                                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                'Нет изображения'
                                            )}
                                        </td>
                                        <td>
                                            <Link to={`/parts/${part.id}`}>{part.name}</Link>
                                        </td>
                                        <td>{part.description || 'N/A'}</td>
                                        <td>{parseFloat(part.price).toLocaleString()} ₽</td>
                                        <td>
                                            {part.compatibility && typeof part.compatibility === 'object' ? (
                                                <pre style={{ whiteSpace: 'pre-wrap' }}>
                                                    {JSON.stringify(part.compatibility, null, 2)}
                                                </pre>
                                            ) : (
                                                part.compatibility || 'N/A'
                                            )}
                                        </td>
                                        <td>{part.stock}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Запчасти не найдены.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            )}
        </Container>
    );
};

export default HomePage;
