// src/components/PartManagementPage.js

import React, { useEffect, useState } from 'react';
import axios from '../../redux/axios';
import {
    Table,
    Button,
    Container,
    Modal,
    Form,
    Alert,
    Spinner,
    Pagination
} from 'react-bootstrap';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table as DocTable, TableCell, TableRow, WidthType } from 'docx';

const PartManagementPage = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        price: '',
        stock: '',
    });

    const [compatibilityFields, setCompatibilityFields] = useState([]);
    const [formErrors, setFormErrors] = useState('');

    const [imageFile, setImageFile] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    useEffect(() => {
        fetchParts();
    }, [currentPage]);

    const fetchParts = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/parts', {
                params: {
                    page: currentPage,
                    limit,
                },
            });
            const { parts, pages } = response.data;
            setParts(parts);
            setTotalPages(pages);
        } catch (err) {
            console.error('Ошибка получения запчастей:', err);
            setError(err.response?.data?.message || 'Ошибка при загрузке запчастей.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            price: '',
            stock: '',
        });
        setCompatibilityFields([]);
        setIsEditing(false);
        setFormErrors('');
        setImageFile(null);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            id: '',
            name: '',
            description: '',
            price: '',
            stock: '',
        });
        setCompatibilityFields([]);
        setFormErrors('');
        setImageFile(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCompatibilityChange = (index, field, value) => {
        const newFields = [...compatibilityFields];
        newFields[index][field] = value;
        setCompatibilityFields(newFields);
    };

    const addCompatibilityField = () => {
        setCompatibilityFields([...compatibilityFields, { key: '', value: '' }]);
    };

    const removeCompatibilityField = (index) => {
        const newFields = [...compatibilityFields];
        newFields.splice(index, 1);
        setCompatibilityFields(newFields);
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        } else {
            setImageFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors('');

        const { id, name, description, price, stock } = formData;

        if (!name.trim()) {
            setFormErrors('Название запчасти обязательно.');
            return;
        }

        if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            setFormErrors('Цена должна быть положительным числом.');
            return;
        }

        if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
            setFormErrors('Количество должно быть неотрицательным целым числом.');
            return;
        }

        let compatibilityObj = {};
        for (let i = 0; i < compatibilityFields.length; i++) {
            const { key, value } = compatibilityFields[i];
            if (!key.trim()) {
                setFormErrors('Все ключи в совместимости должны быть заполнены.');
                return;
            }
            compatibilityObj[key] = value;
        }

        const partData = {
            name,
            description,
            price: parseFloat(price),
            compatibility: compatibilityObj,
            stock: parseInt(stock),
        };

        try {
            setLoading(true);
            let response;
            if (isEditing) {
                response = await axios.put(`/parts/${id}`, partData);
            } else {
                response = await axios.post('/parts', partData);
            }

            const savedPart = response.data.part;

            const formDataImage = new FormData();
            formDataImage.append('image', imageFile);
            await axios.post(`/parts/${savedPart.id}/image`, formDataImage, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            handleCloseModal();
            fetchParts();
        } catch (err) {
            console.error('Ошибка при сохранении запчасти:', err);
            setFormErrors(err.response?.data?.message || 'Ошибка при сохранении запчасти.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (part) => {
        setFormData({
            id: part.id,
            name: part.name,
            description: part.description || '',
            price: part.price,
            stock: part.stock,
        });

        const compObj = part.compatibility || {};
        const fields = Object.keys(compObj).map(key => ({
            key,
            value: compObj[key]
        }));
        setCompatibilityFields(fields);

        setIsEditing(true);
        setFormErrors('');
        setImageFile(null);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запчасть?')) {
            try {
                setLoading(true);
                await axios.delete(`/parts/${id}`);
                fetchParts();
            } catch (err) {
                console.error('Ошибка при удалении запчасти:', err);
                setError(err.response?.data?.message || 'Ошибка при удалении запчасти.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>,
            );
        }
        return <Pagination>{items}</Pagination>;
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(parts.map(part => ({
            Название: part.name,
            Описание: part.description,
            Цена: `$${parseFloat(part.price).toFixed(2)}`,
            Совместимость: JSON.stringify(part.compatibility, null, 2),
            Количество: part.stock
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Запчасти');
        XLSX.writeFile(workbook, 'parts.xlsx');
    };

    const exportToDocx = () => {
        const rows = parts.map(part => new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph(part.name)],
                    width: { size: 20, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(part.description || '')],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(`$${parseFloat(part.price).toFixed(2)}`)],
                    width: { size: 15, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(JSON.stringify(part.compatibility, null, 2) || '')],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(part.stock.toString())],
                    width: { size: 10, type: WidthType.PERCENTAGE },
                })
            ]
        }));

        const doc = new Document({
            sections: [
                {
                    children: [
                        new DocTable({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph('Название')],
                                            width: { size: 20, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Описание')],
                                            width: { size: 30, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Цена')],
                                            width: { size: 15, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Совместимость')],
                                            width: { size: 25, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Количество')],
                                            width: { size: 10, type: WidthType.PERCENTAGE },
                                        })
                                    ]
                                }),
                                ...rows
                            ]
                        })
                    ]
                }
            ]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'parts.docx');
        });
    };

    return (
        <Container className="mt-5">
            <h2>Управление запчастями</h2>
            <Button variant="primary" className="mb-3" onClick={handleShowModal}>
                Добавить запчасть
            </Button>
            <Button variant="success" className="mb-3 ms-3" onClick={exportToExcel}>
                Экспорт в Excel
            </Button>
            <Button variant="info" className="mb-3 ms-3" onClick={exportToDocx}>
                Экспорт в DOCX
            </Button>

            {loading && !showModal ? (
                <Spinner animation="border" variant="primary" />
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
                                <th>Количество на складе</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parts.map((part) => (
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
                                    <td>{part.name}</td>
                                    <td>{part.description}</td>
                                    <td>${parseFloat(part.price).toFixed(2)}</td>
                                    <td>
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(part.compatibility, null, 2)}
                                        </pre>
                                    </td>
                                    <td>{part.stock}</td>
                                    <td>
                                        <Button variant="warning" size="sm" onClick={() => handleEdit(part)}>
                                            Редактировать
                                        </Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(part.id)}>
                                            Удалить
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {renderPagination()}
                </>
            )}

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Редактировать запчасть' : 'Добавить запчасть'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {formErrors && <Alert variant="danger">{formErrors}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="name" className="mb-3">
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="description" className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Описание запчасти"
                            />
                        </Form.Group>

                        <Form.Group controlId="price" className="mb-3">
                            <Form.Label>Цена ($)</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </Form.Group>

                        <Form.Label>Совместимость</Form.Label>
                        {compatibilityFields.map((field, index) => (
                            <div key={index} className="d-flex mb-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Ключ"
                                    value={field.key}
                                    onChange={(e) => handleCompatibilityChange(index, 'key', e.target.value)}
                                    className="me-2"
                                    required
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Значение"
                                    value={field.value}
                                    onChange={(e) => handleCompatibilityChange(index, 'value', e.target.value)}
                                    required
                                />
                                <Button variant="danger" className="ms-2" onClick={() => removeCompatibilityField(index)}>X</Button>
                            </div>
                        ))}
                        <Button variant="secondary" className="mb-3" onClick={addCompatibilityField}>
                            Добавить поле
                        </Button>

                        <Form.Group controlId="stock" className="mb-3">
                            <Form.Label>Количество на складе</Form.Label>
                            <Form.Control
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="image" className="mb-3">
                            <Form.Label>Изображение</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <Form.Text className="text-muted">
                                Если вы не выберете изображение при редактировании, текущее изображение останется без изменений.
                            </Form.Text>
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default PartManagementPage;
