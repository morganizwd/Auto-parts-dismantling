// src/components/SupplierManagementPage.js

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

const SupplierManagementPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        rating: '',
    });

    const [contactInfoFields, setContactInfoFields] = useState([]);

    const [formErrors, setFormErrors] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    useEffect(() => {
        fetchSuppliers();
    }, [currentPage]);

    const fetchSuppliers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('/suppliers', {
                params: {
                    page: currentPage,
                    limit,
                },
            });
            const { suppliers, pages } = response.data;
            setSuppliers(suppliers);
            setTotalPages(pages);
        } catch (err) {
            console.error('Ошибка получения поставщиков:', err);
            setError(err.response?.data?.message || 'Ошибка при загрузке поставщиков.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = () => {
        setFormData({
            id: '',
            name: '',
            rating: '',
        });
        setContactInfoFields([]);
        setIsEditing(false);
        setFormErrors('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            id: '',
            name: '',
            rating: '',
        });
        setContactInfoFields([]);
        setFormErrors('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleContactInfoChange = (index, field, value) => {
        const newFields = [...contactInfoFields];
        newFields[index][field] = value;
        setContactInfoFields(newFields);
    };

    const addContactInfoField = () => {
        setContactInfoFields([...contactInfoFields, { key: '', value: '' }]);
    };

    const removeContactInfoField = (index) => {
        const newFields = [...contactInfoFields];
        newFields.splice(index, 1);
        setContactInfoFields(newFields);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors('');

        const { id, name, rating } = formData;

        if (!name.trim()) {
            setFormErrors('Название поставщика обязательно.');
            return;
        }

        let contactInfoObj = {};
        for (let i = 0; i < contactInfoFields.length; i++) {
            const { key, value } = contactInfoFields[i];
            if (!key.trim()) {
                setFormErrors('Все ключи в контактной информации должны быть заполнены.');
                return;
            }
            contactInfoObj[key] = value;
        }

        let ratingValue = parseFloat(rating);
        if (rating && (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5)) {
            setFormErrors('Рейтинг должен быть числом от 0 до 5.');
            return;
        }

        const supplierData = {
            name,
            contact_info: contactInfoObj,
            rating: ratingValue || 0.0,
        };

        try {
            setLoading(true);
            if (isEditing) {
                await axios.put(`/suppliers/${id}`, supplierData);
            } else {
                await axios.post('/suppliers', supplierData);
            }
            handleCloseModal();
            fetchSuppliers(); 
        } catch (err) {
            console.error('Ошибка при сохранении поставщика:', err);
            setFormErrors(err.response?.data?.message || 'Ошибка при сохранении поставщика.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supplier) => {
        setFormData({
            id: supplier.id,
            name: supplier.name,
            rating: supplier.rating || ''
        });

        const contactInfoObj = supplier.contact_info || {};
        const fields = Object.keys(contactInfoObj).map(key => ({
            key,
            value: contactInfoObj[key]
        }));
        setContactInfoFields(fields);

        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этого поставщика?')) {
            try {
                setLoading(true);
                await axios.delete(`/suppliers/${id}`);
                fetchSuppliers(); 
            } catch (err) {
                console.error('Ошибка при удалении поставщика:', err);
                setError(err.response?.data?.message || 'Ошибка при удалении поставщика.');
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
        const worksheet = XLSX.utils.json_to_sheet(suppliers.map(supplier => ({
            Название: supplier.name,
            'Контактная информация': JSON.stringify(supplier.contact_info, null, 2),
            Рейтинг: Number(supplier.rating || 0).toFixed(2)
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Поставщики');
        XLSX.writeFile(workbook, 'suppliers.xlsx');
    };

    const exportToDocx = () => {
        const rows = suppliers.map(supplier => new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph(supplier.name)],
                    width: { size: 50, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(JSON.stringify(supplier.contact_info, null, 2))],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(Number(supplier.rating || 0).toFixed(2))],
                    width: { size: 20, type: WidthType.PERCENTAGE },
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
                                            width: { size: 50, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Контактная информация')],
                                            width: { size: 30, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Рейтинг')],
                                            width: { size: 20, type: WidthType.PERCENTAGE },
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
            saveAs(blob, 'suppliers.docx');
        });
    };

    return (
        <Container className="mt-5">
            <h2>Управление поставщиками</h2>
            <Button variant="primary" className="mb-3" onClick={handleShowModal}>
                Добавить поставщика
            </Button>
            <Button variant="success" className="mb-3 ms-3" onClick={exportToExcel}>
                Экспорт в Excel
            </Button>
            <Button variant="info" className="mb-3 ms-3" onClick={exportToDocx}>
                Экспорт в DOCX
            </Button>

            {loading ? (
                <Spinner animation="border" variant="primary" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Контактная информация</th>
                                <th>Рейтинг</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td>{supplier.name}</td>
                                    <td>
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(supplier.contact_info, null, 2)}
                                        </pre>
                                    </td>
                                    <td>{Number(supplier.rating || 0).toFixed(2)}</td>
                                    <td>
                                        <Button variant="warning" size="sm" onClick={() => handleEdit(supplier)}>
                                            Редактировать
                                        </Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(supplier.id)}>
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

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? 'Редактировать поставщика' : 'Добавить поставщика'}</Modal.Title>
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

                        <Form.Label>Контактная информация</Form.Label>
                        {contactInfoFields.map((field, index) => (
                            <div key={index} className="d-flex mb-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Ключ"
                                    value={field.key}
                                    onChange={(e) => handleContactInfoChange(index, 'key', e.target.value)}
                                    className="me-2"
                                    required
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Значение"
                                    value={field.value}
                                    onChange={(e) => handleContactInfoChange(index, 'value', e.target.value)}
                                    required
                                />
                                <Button variant="danger" className="ms-2" onClick={() => removeContactInfoField(index)}>X</Button>
                            </div>
                        ))}
                        <Button variant="secondary" className="mb-3" onClick={addContactInfoField}>
                            Добавить поле
                        </Button>

                        <Form.Group controlId="rating" className="mb-3">
                            <Form.Label>Рейтинг</Form.Label>
                            <Form.Control
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                min="0"
                                max="5"
                                step="0.01"
                                placeholder="0.00 - 5.00"
                            />
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

export default SupplierManagementPage;
