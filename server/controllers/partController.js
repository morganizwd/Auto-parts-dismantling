// controllers/partController.js

const { Op, where, fn, col } = require('sequelize');
const { Part, Supplier, Inventory, Review } = require('../models/models.js');

const createPart = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { name, description, price, compatibility, stock, supplier_id } = req.body;

        if (!name || !price || stock === undefined) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все обязательные поля (name, price, stock)' });
        }

        let supplier = null;
        if (supplier_id) {
            supplier = await Supplier.findByPk(supplier_id);
            if (!supplier) {
                return res.status(400).json({ message: 'Поставщик с указанным ID не найден' });
            }
        }

        const newPart = await Part.create({
            name,
            description,
            price,
            compatibility,
            stock,
            supplier_id: supplier ? supplier.id : null,
        });

        res.status(201).json({ part: newPart });
    } catch (error) {
        console.error('Ошибка создания запчасти:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const updatePart = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;
        const { name, description, price, compatibility, stock, supplier_id } = req.body;

        const part = await Part.findByPk(id);
        if (!part) {
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        if (supplier_id) {
            const supplier = await Supplier.findByPk(supplier_id);
            if (!supplier) {
                return res.status(400).json({ message: 'Поставщик с указанным ID не найден' });
            }
            part.supplier_id = supplier_id;
        }

        if (name) part.name = name;
        if (description) part.description = description;
        if (price) part.price = price;
        if (compatibility) part.compatibility = compatibility;
        if (stock !== undefined) part.stock = stock;

        await part.save();

        res.status(200).json({ part });
    } catch (error) {
        console.error('Ошибка обновления запчасти:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const deletePart = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const part = await Part.findByPk(id);
        if (!part) {
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        await part.destroy();

        res.status(200).json({ message: 'Запчасть успешно удалена' });
    } catch (error) {
        console.error('Ошибка удаления запчасти:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getAllParts = async (req, res) => {
    try {
        const {
            search,
            minPrice,
            maxPrice,
            supplier_id,
            compatibility,
            sortBy,
            sortOrder,
            page = 1,
            limit = 10,
        } = req.query;

        const whereClause = {};

        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                whereClause.price[Op.gte] = parseFloat(minPrice);
            }
            if (maxPrice) {
                whereClause.price[Op.lte] = parseFloat(maxPrice);
            }
        }

        if (supplier_id) {
            whereClause.supplier_id = supplier_id;
        }

        if (compatibility) {
            whereClause['compatibility.Cars'] = { [Op.iLike]: `%${compatibility}%` };
        }

        let orderClause = [['createdAt', 'DESC']];
        if (sortBy) {
            const order = sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
            orderClause = [[sortBy, order]];
        }

        const offset = (page - 1) * limit;

        const { rows: parts, count } = await Part.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name', 'rating'],
                },
                {
                    model: Inventory,
                    attributes: ['id', 'quantity', 'location'],
                },
            ],
        });

        res.status(200).json({
            parts,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Ошибка получения запчастей:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getPartById = async (req, res) => {
    try {
        const { id } = req.params;

        const part = await Part.findByPk(id, {
            include: [
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name', 'rating', 'contact_info'],
                },
                {
                    model: Inventory,
                    attributes: ['id', 'quantity', 'location'],
                },
                {
                    model: Review,
                    attributes: ['id', 'rating', 'comment', 'createdAt'],
                },
            ],
            attributes: {
                include: [
                    [fn('AVG', col('Reviews.rating')), 'averageRating'],
                    [fn('COUNT', col('Reviews.id')), 'reviewsCount'],
                ],
            },
            group: ['Part.id', 'supplier.id', 'Inventories.id', 'Reviews.id'],
        });

        if (!part) {
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        res.status(200).json({ part });
    } catch (error) {
        console.error('Ошибка получения запчасти по ID:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const uploadPartImage = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const part = await Part.findByPk(id);
        if (!part) {
            if (req.file) {

            }
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Файл не загружен' });
        }

        part.image = req.file.filename;
        await part.save();

        res.status(200).json({ message: 'Изображение успешно загружено', part });
    } catch (error) {
        console.error('Ошибка загрузки изображения для запчасти:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    createPart,
    updatePart,
    deletePart,
    getAllParts,
    getPartById,
    uploadPartImage,
};
