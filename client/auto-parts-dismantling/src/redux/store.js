import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import supplierReducer from './slices/supplierSlice';
import reviewReducer from './slices/reviewSlice';
import partReducer from './slices/partSlice';
import orderReducer from './slices/orderSlice';
import inventoryReducer from './slices/inventorySlice';
import favoriteReducer from './slices/favoriteSlice';
import cartReducer from './slices/cartSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        suppliers: supplierReducer,
        reviews: reviewReducer,
        parts: partReducer,
        orders: orderReducer,
        inventory: inventoryReducer,
        favorites: favoriteReducer,
        cart: cartReducer,
    },
});

export default store;