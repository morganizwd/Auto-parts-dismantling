// src/middleware/uploadPartImage.js

const multer = require('multer');
const path = require('path');

// Конфигурация хранилища multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/parts'); // папка для сохранения изображений
    },
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла на основе времени и оригинального имени
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Проверка, является ли файл изображением
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неверный тип файла. Допустимы только изображения (jpeg, png, gif).'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
