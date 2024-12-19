const { User } = require('../models/models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
        }

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email или username уже существует' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'client',
        });

        const token = jwt.sign(
            { userId: newUser.id, role: newUser.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            },
            token,
        });
    } catch (error) {
        console.error('Ошибка регистрации пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Ошибка входа пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Ошибка получения профиля пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (currentUser.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error('Ошибка получения списка пользователей:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, email, password } = req.body;

        console.log('Полученные данные для обновления:', req.body); 

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Ошибка обновления профиля пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        await user.destroy();

        res.status(200).json({ message: 'Пользователь успешно удален' });
    } catch (error) {
        console.error('Ошибка удаления пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const getUserById = async (req, res) => {
    try {
        const currentUser = await User.findByPk(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (currentUser.role !== 'operator') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }

        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt'],
        });

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Ошибка получения пользователя по ID:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserById,
};