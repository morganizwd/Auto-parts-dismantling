const { Review, Part, User } = require('../models/models.js');
const { Op } = require('sequelize');
const Joi = require('joi');

const reviewSchema = Joi.object({
    part_id: Joi.string().uuid().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow('', null),
});

const createReview = async (req, res) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { error, value } = reviewSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { part_id, rating, comment } = value;

        const part = await Part.findByPk(part_id);
        if (!part) {
            return res.status(404).json({ message: 'Запчасть не найдена' });
        }

        const existingReview = await Review.findOne({
            where: {
                user_id: req.user.userId,
                part_id,
            },
        });
        if (existingReview) {
            return res.status(400).json({ message: 'Вы уже оставили отзыв для этой запчасти' });
        }

        const newReview = await Review.create({
            user_id: req.user.userId,
            part_id,
            rating,
            comment,
        });

        res.status(201).json({ review: newReview });
    } catch (error) {
        console.error('Ошибка создания отзыва:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const { part_id, user_id, rating, page = 1, limit = 10 } = req.query;

        const whereClause = {};

        if (part_id) {
            whereClause.part_id = part_id;
        }

        if (req.user.role === 'client') {
            whereClause.user_id = req.user.userId;
        } else if (user_id) {
            whereClause.user_id = user_id;
        }

        if (rating) {
            whereClause.rating = rating;
        }

        const offset = (page - 1) * limit;

        const { rows: reviews, count } = await Review.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name'],
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'email'],
                },
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
        });

        res.status(200).json({
            reviews,
            total: count,
            page: parseInt(page),
            pages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Ошибка получения отзывов:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id, {
            include: [
                {
                    model: Part,
                    attributes: ['id', 'name'],
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'email'],
                },
            ],
        });

        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден' });
        }

        if (req.user.role === 'client' && review.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        res.status(200).json({ review });
    } catch (error) {
        console.error('Ошибка получения отзыва:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден' });
        }

        if (req.user.role === 'client' && review.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { error, value } = reviewSchema.validate(req.body, { presence: 'optional' });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { rating, comment } = value;

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();

        res.status(200).json({ review });
    } catch (error) {
        console.error('Ошибка обновления отзыва:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден' });
        }

        if (req.user.role === 'client' && review.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        await review.destroy();

        res.status(200).json({ message: 'Отзыв успешно удален' });
    } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    createReview,
    getAllReviews,
    getReviewById,
    updateReview,
    deleteReview,
};
