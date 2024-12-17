const { Supplier, Part, Inventory } = require('../models/models.js');
const { Op } = require('sequelize');

const createSupplier = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { name, contact_info, rating } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Пожалуйста, укажите название поставщика' });
        }

        const existingSupplier = await Supplier.findOne({ where: { name } });
        if (existingSupplier) {
            return res.status(400).json({ message: 'Поставщик с таким названием уже существует' });
        }

        const newSupplier = await Supplier.create({
            name,
            contact_info,
            rating: rating || 0.00,
        });

        res.status(201).json({ supplier: newSupplier });
    } catch (error) {
        console.error('Ошибка создания поставщика:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;
        const { name, contact_info, rating } = req.body;

        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            return res.status(404).json({ message: 'Поставщик не найден' });
        }

        if (name && name !== supplier.name) {
            const existingSupplier = await Supplier.findOne({ where: { name } });
            if (existingSupplier) {
                return res.status(400).json({ message: 'Поставщик с таким названием уже существует' });
            }
            supplier.name = name;
        }

        if (contact_info) supplier.contact_info = contact_info;
        if (rating !== undefined) {
            if (rating < 0 || rating > 5) {
                return res.status(400).json({ message: 'Рейтинг должен быть между 0.00 и 5.00' });
            }
            supplier.rating = rating;
        }

        await supplier.save();

        res.status(200).json({ supplier });
    } catch (error) {
        console.error('Ошибка обновления поставщика:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const supplier = await Supplier.findByPk(id);
        if (!supplier) {
            return res.status(404).json({ message: 'Поставщик не найден' });
        }

        const partsCount = await Part.count({ where: { supplier_id: id } });
        const inventoryCount = await Inventory.count({ where: { supplier_id: id } });

        if (partsCount > 0 || inventoryCount > 0) {
            return res.status(400).json({ message: 'Нельзя удалить поставщика, у которого есть связанные запчасти или инвентарь' });
        }

        await supplier.destroy();

        res.status(200).json({ message: 'Поставщик успешно удален' });
    } catch (error) {
        console.error('Ошибка удаления поставщика:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getAllSuppliers = async (req, res) => {
    try {
        const {
            search, 
            minRating,
            maxRating,
            sortBy, 
            sortOrder,
            page = 1,
            limit = 10,
        } = req.query;

        const whereClause = {};

        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }

        if (minRating || maxRating) {
            whereClause.rating = {};
            if (minRating) {
                whereClause.rating[Op.gte] = parseFloat(minRating);
            }
            if (maxRating) {
                whereClause.rating[Op.lte] = parseFloat(maxRating);
            }
        }

        let orderClause = [['createdAt', 'DESC']]; 
        if (sortBy) {
            const order = sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
            orderClause = [[sortBy, order]];
        }

        const offset = (page - 1) * limit;

        const { rows: suppliers, count } = await Supplier.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name', 'price', 'stock'],
                },
                {
                    model: Inventory,
                    attributes: ['id', 'quantity', 'location'],
                },
            ],
        });

        res.status(200).json({
            suppliers,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Ошибка получения поставщиков:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        const supplier = await Supplier.findByPk(id, {
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name', 'price', 'stock'],
                },
                {
                    model: Inventory,
                    attributes: ['id', 'quantity', 'location'],
                },
            ],
        });

        if (!supplier) {
            return res.status(404).json({ message: 'Поставщик не найден' });
        }

        res.status(200).json({ supplier });
    } catch (error) {
        console.error('Ошибка получения поставщика по ID:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getAllSuppliers,
    getSupplierById,
};
