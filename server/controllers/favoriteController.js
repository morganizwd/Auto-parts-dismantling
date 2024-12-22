const { Favorite, Part } = require('../models/models.js');
const Joi = require('joi');

const favoriteSchema = Joi.object({
    part_id: Joi.string().uuid().required(),
});

const addFavorite = async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { error, value } = favoriteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { part_id } = value;

        const part = await Part.findByPk(part_id);
        if (!part) {
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        const existingFavorite = await Favorite.findOne({
            where: {
                user_id: req.user.userId,
                part_id,
            },
        });
        if (existingFavorite) {
            return res.status(400).json({ message: 'Запчасть уже добавлена в избранное' });
        }

        const newFavorite = await Favorite.create({
            user_id: req.user.userId,
            part_id,
        });

        res.status(201).json({ favorite: newFavorite });
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const removeFavorite = async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { part_id } = req.params;

        const favorite = await Favorite.findOne({
            where: {
                user_id: req.user.userId,
                part_id,
            },
        });

        if (!favorite) {
            return res.status(404).json({ message: 'Запчасть не найдена в избранном' });
        }

        await favorite.destroy();

        res.status(200).json({ message: 'Запчасть успешно удалена из избранного' });
    } catch (error) {
        console.error('Ошибка удаления из избранного:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getFavorites = async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { page = 1, limit = 10, part_id } = req.query;

        const offset = (page - 1) * limit;

        const whereClause = {
            user_id: req.user.userId,
        };
        if (part_id) {
            whereClause.part_id = part_id;
        }

        const { rows: favorites, count } = await Favorite.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name', 'description', 'price', 'compatibility', 'stock'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            favorites,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Ошибка получения избранных запчастей:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    getFavorites,
};
