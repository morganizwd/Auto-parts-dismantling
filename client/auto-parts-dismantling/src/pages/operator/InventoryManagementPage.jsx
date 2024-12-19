// src/components/InventoryManagementPage.js

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

const InventoryManagementPage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [parts, setParts] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        part_id: '',
        quantity: '',
        location: '',
        supplier_id: '',
    });

    const [formErrors, setFormErrors] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    useEffect(() => {
        fetchAllData();
    }, [currentPage]);

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const inventoryResponse = await axios.get('/inventories', {
                params: {
                    page: currentPage,
                    limit,
                },
            });
            const { inventories, pages } = inventoryResponse.data;
            setInventoryItems(inventories);
            setTotalPages(pages);

            const suppliersResponse = await axios.get('/suppliers', {
                params: {

                },
            });
            const { suppliers: fetchedSuppliers } = suppliersResponse.data;
            setSuppliers(fetchedSuppliers);

            const partsResponse = await axios.get('/parts', {
                params: {

                },
            });
            const { parts: fetchedParts } = partsResponse.data;
            setParts(fetchedParts);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Error loading data.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowModal = () => {
        setFormData({
            id: '',
            part_id: '',
            quantity: '',
            location: '',
            supplier_id: '',
        });
        setIsEditing(false);
        setFormErrors('');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setFormData({
            id: '',
            part_id: '',
            quantity: '',
            location: '',
            supplier_id: '',
        });
        setFormErrors('');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors('');

        const { id, part_id, quantity, location, supplier_id } = formData;

        if (!part_id) {
            setFormErrors('Запчасть обязательно.');
            return;
        }

        if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
            setFormErrors('Количество должно быть неотрицательным целым числом.');
            return;
        }

        if (!location.trim()) {
            setFormErrors('Местоположение обязательно.');
            return;
        }

        const inventoryData = {
            part_id,
            quantity: parseInt(quantity),
            location,
            supplier_id: supplier_id || null,
        };

        try {
            setLoading(true);
            if (isEditing) {
                await axios.put(`/inventories/${id}`, inventoryData);
            } else {
                await axios.post('/inventories', inventoryData);
            }
            handleCloseModal();
            fetchAllData(); 
        } catch (err) {
            console.error('Error saving inventory item:', err);
            setFormErrors(err.response?.data?.message || 'Error saving inventory item.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (inventory) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/inventories/${inventory.id}`);
            const { inventory: fetchedInventory } = response.data;
            setFormData({
                id: fetchedInventory.id,
                part_id: fetchedInventory.part_id,
                quantity: fetchedInventory.quantity,
                location: fetchedInventory.location,
                supplier_id: fetchedInventory.supplier_id || '',
            });
            setIsEditing(true);
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching inventory item:', err);
            setError(err.response?.data?.message || 'Error fetching inventory item.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запись инвентаря?')) {
            try {
                setLoading(true);
                await axios.delete(`/inventories/${id}`);
                fetchAllData(); 
            } catch (err) {
                console.error('Error deleting inventory item:', err);
                setError(err.response?.data?.message || 'Error deleting inventory item.');
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
        const worksheet = XLSX.utils.json_to_sheet(inventoryItems.map(item => ({
            Запчасть: item.Part ? item.Part.name : 'N/A',
            Количество: item.quantity,
            Местоположение: item.location,
            Поставщик: item.Supplier ? item.Supplier.name : 'N/A'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Инвентарь');
        XLSX.writeFile(workbook, 'inventory.xlsx');
    };

    const exportToDocx = () => {
        const rows = inventoryItems.map(item => new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph(item.Part ? item.Part.name : 'N/A')],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(item.quantity.toString())],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(item.location)],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                    children: [new Paragraph(item.Supplier ? item.Supplier.name : 'N/A')],
                    width: { size: 25, type: WidthType.PERCENTAGE },
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
                                            children: [new Paragraph('Запчасть')],
                                            width: { size: 25, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Количество')],
                                            width: { size: 25, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Местоположение')],
                                            width: { size: 25, type: WidthType.PERCENTAGE },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph('Поставщик')],
                                            width: { size: 25, type: WidthType.PERCENTAGE },
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
            saveAs(blob, 'inventory.docx');
        });
    };

    return (
        <Container className="mt-5">
            <h2>Управление инвентарём</h2>
            <Button variant="primary" className="mb-3" onClick={handleShowModal}>
                Добавить запись инвентаря
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
                                <th>Запчасть</th>
                                <th>Количество</th>
                                <th>Местоположение</th>
                                <th>Поставщик</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.Part ? item.Part.name : 'N/A'}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.location}</td>
                                    <td>{item.Supplier ? item.Supplier.name : 'N/A'}</td>
                                    <td>
                                        <Button variant="warning" size="sm" onClick={() => handleEdit(item)}>
                                            Редактировать
                                        </Button>{' '}
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
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
                    <Modal.Title>{isEditing ? 'Редактировать запись инвентаря' : 'Добавить запись инвентаря'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {formErrors && <Alert variant="danger">{formErrors}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="part_id" className="mb-3">
                            <Form.Label>Запчасть</Form.Label>
                            <Form.Select
                                name="part_id"
                                value={formData.part_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите запчасть</option>
                                {parts.map((part) => (
                                    <option key={part.id} value={part.id}>
                                        {part.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="quantity" className="mb-3">
                            <Form.Label>Количество</Form.Label>
                            <Form.Control
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="location" className="mb-3">
                            <Form.Label>Местоположение</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="supplier_id" className="mb-3">
                            <Form.Label>Поставщик</Form.Label>
                            <Form.Select
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleChange}
                            >
                                <option value="">Не указан</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </Form.Select>
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

export default InventoryManagementPage;