const { Order, OrderItem, Part, User } = require('../models/models.js');
const { Op } = require('sequelize');
const sequelize = require('../db');

const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if (req.user.role !== 'client') {
            await t.rollback();
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { delivery_method, items, address } = req.body; // Добавляем чтение address из тела запроса

        if (!delivery_method || !items || !Array.isArray(items) || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Пожалуйста, укажите способ доставки и список запчастей для заказа' });
        }

        // Если delivery_method = 'courier', нужно проверить наличие address
        if (delivery_method === 'courier' && (!address || address.trim() === '')) {
            await t.rollback();
            return res.status(400).json({ message: 'Пожалуйста, укажите адрес доставки' });
        }

        const partIds = items.map(item => item.part_id);
        const parts = await Part.findAll({
            where: { id: { [Op.in]: partIds } },
            transaction: t,
        });

        if (parts.length !== partIds.length) {
            await t.rollback();
            return res.status(400).json({ message: 'Некоторые запчасти не найдены' });
        }

        for (const item of items) {
            const part = parts.find(p => p.id === item.part_id);
            if (part.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({ message: `Недостаточно запчастей "${part.name}" на складе` });
            }
        }

        let totalPrice = 0;
        for (const item of items) {
            const part = parts.find(p => p.id === item.part_id);
            totalPrice += parseFloat(part.price) * item.quantity;
        }

        const newOrder = await Order.create({
            user_id: req.user.userId,
            status: 'pending',
            total_price: totalPrice.toFixed(2),
            delivery_method,
            address: delivery_method === 'courier' ? address : null,
        }, { transaction: t });

        for (const item of items) {
            const part = parts.find(p => p.id === item.part_id);

            await OrderItem.create({
                order_id: newOrder.id,
                part_id: part.id,
                quantity: item.quantity,
                price: part.price,
            }, { transaction: t });

            part.stock -= item.quantity;
            await part.save({ transaction: t });
        }

        await t.commit();

        res.status(201).json({ order: newOrder });
    } catch (error) {
        await t.rollback();
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getOrders = async (req, res) => {
    try {
        const { status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

        const whereClause = {};

        if (req.user.role === 'client') {
            whereClause.user_id = req.user.userId;
        }

        if (status) {
            whereClause.status = status;
        }

        let orderClause = [['createdAt', 'DESC']];
        if (sortBy) {
            const order = sortOrder && ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
            orderClause = [[sortBy, order]];
        }

        const offset = (page - 1) * limit;

        const { rows: orders, count } = await Order.findAndCountAll({
            where: whereClause,
            order: orderClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Part,
                            attributes: ['id', 'name', 'price'],
                        },
                    ],
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'email'],
                },
            ],
        });

        res.status(200).json({
            orders,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    include: [
                        {
                            model: Part,
                            attributes: ['id', 'name', 'price', 'compatibility'],
                        },
                    ],
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'email'],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        if (req.user.role === 'client' && order.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Ошибка получения заказа по ID:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        if (req.user.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Статус должен быть одним из следующих: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ order });
    } catch (error) {
        console.error('Ошибка обновления статуса заказа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const cancelOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        if (req.user.role !== 'client') {
            await t.rollback();
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    include: [Part],
                },
            ],
            transaction: t,
        });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        if (order.user_id !== req.user.userId) {
            await t.rollback();
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        if (order.status !== 'pending') {
            await t.rollback();
            return res.status(400).json({ message: 'Нельзя отменить заказ со статусом, отличным от "pending"' });
        }

        order.status = 'cancelled';
        await order.save({ transaction: t });

        for (const item of order.OrderItems) {
            const part = item.Part;
            part.stock += item.quantity;
            await part.save({ transaction: t });
        }

        await t.commit();

        res.status(200).json({ message: 'Заказ успешно отменен', order });
    } catch (error) {
        await t.rollback();
        console.error('Ошибка отмены заказа:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
};
