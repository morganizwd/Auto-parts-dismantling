const { Inventory, Part, Supplier } = require('../models/models.js');
const Joi = require('joi');

const inventorySchema = Joi.object({
    part_id: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(0).required(),
    location: Joi.string().required(),
    supplier_id: Joi.string().uuid().optional().allow(null),
});

const createInventory = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { error, value } = inventorySchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { part_id, quantity, location, supplier_id } = value;

        const part = await Part.findByPk(part_id);
        if (!part) {
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        if (supplier_id) {
            const supplier = await Supplier.findByPk(supplier_id);
            if (!supplier) {
                return res.status(404).json({ message: 'Поставщик не найден' });
            }
        }

        const newInventory = await Inventory.create({
            part_id,
            quantity,
            location,
            supplier_id: supplier_id || null,
        });

        res.status(201).json({ inventory: newInventory });
    } catch (error) {
        console.error('Ошибка создания инвентаря:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getAllInventory = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { part_id, supplier_id, location, page = 1, limit = 10 } = req.query;

        const whereClause = {};

        if (part_id) {
            whereClause.part_id = part_id;
        }

        if (supplier_id) {
            whereClause.supplier_id = supplier_id;
        }

        if (location) {
            whereClause.location = { [Op.iLike]: `%${location}%` };
        }

        const offset = (page - 1) * limit;

        const { rows: inventories, count } = await Inventory.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name', 'price', 'stock'],
                },
                {
                    model: Supplier,
                    attributes: ['id', 'name', 'rating'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            inventories,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Ошибка получения инвентаря:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getInventoryById = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const inventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name', 'price', 'stock'],
                },
                {
                    model: Supplier,
                    attributes: ['id', 'name', 'rating'],
                },
            ],
        });

        if (!inventory) {
            return res.status(404).json({ message: 'Запись инвентаря не найдена' });
        }

        res.status(200).json({ inventory });
    } catch (error) {
        console.error('Ошибка получения инвентаря по ID:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const updateInventory = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const { error, value } = inventorySchema.validate(req.body, { presence: 'optional' });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { part_id, quantity, location, supplier_id } = value;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ message: 'Запись инвентаря не найдена' });
        }

        if (part_id && part_id !== inventory.part_id) {
            const part = await Part.findByPk(part_id);
            if (!part) {
                return res.status(404).json({ message: 'Запчасть не найдена' });
            }
            inventory.part_id = part_id;
        }

        if (supplier_id !== undefined) {
            if (supplier_id) {
                const supplier = await Supplier.findByPk(supplier_id);
                if (!supplier) {
                    return res.status(404).json({ message: 'Поставщик не найден' });
                }
                inventory.supplier_id = supplier_id;
            } else {
                inventory.supplier_id = null;
            }
        }

        if (quantity !== undefined) inventory.quantity = quantity;
        if (location) inventory.location = location;

        await inventory.save();

        res.status(200).json({ inventory });
    } catch (error) {
        console.error('Ошибка обновления инвентаря:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const deleteInventory = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ message: 'Запись инвентаря не найдена' });
        }

        await inventory.destroy();

        res.status(200).json({ message: 'Запись инвентаря успешно удалена' });
    } catch (error) {
        console.error('Ошибка удаления инвентаря:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
};
