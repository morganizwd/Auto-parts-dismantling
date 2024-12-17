const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    role: {
        type: DataTypes.ENUM('client', 'operator'),
        defaultValue: 'client',
        allowNull: false,
    },
}, {
    timestamps: true,
});

const Part = sequelize.define('Part', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    compatibility: {
        type: DataTypes.JSON, 
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
}, {
    timestamps: true,
});

const Supplier = sequelize.define('Supplier', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_info: {
        type: DataTypes.JSON, 
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
    },
}, {
    timestamps: true,
});

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    delivery_method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false,
    },
}, {
    timestamps: true,
});

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        },
    },
    comment: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
}, {
    timestamps: true,
});

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

User.hasMany(Order, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Part.hasMany(OrderItem, { foreignKey: 'part_id', onDelete: 'CASCADE' });
OrderItem.belongsTo(Part, { foreignKey: 'part_id' });

User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Part.hasMany(Review, { foreignKey: 'part_id', onDelete: 'CASCADE' });
Review.belongsTo(Part, { foreignKey: 'part_id' });

User.hasMany(Favorite, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

Part.hasMany(Favorite, { foreignKey: 'part_id', onDelete: 'CASCADE' });
Favorite.belongsTo(Part, { foreignKey: 'part_id' });

Supplier.hasMany(Part, { foreignKey: 'supplier_id', onDelete: 'SET NULL' });
Part.belongsTo(Supplier, { foreignKey: 'supplier_id' });

Part.hasMany(Inventory, { foreignKey: 'part_id', onDelete: 'CASCADE' });
Inventory.belongsTo(Part, { foreignKey: 'part_id' });

Supplier.hasMany(Inventory, { foreignKey: 'supplier_id', onDelete: 'SET NULL' });
Inventory.belongsTo(Supplier, { foreignKey: 'supplier_id' });

module.exports = {
    User,
    Part,
    Supplier,
    Order,
    OrderItem,
    Review,
    Favorite,
    Inventory,
    sequelize,
};