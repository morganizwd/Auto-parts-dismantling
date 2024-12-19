// src/redux/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const { part, quantity } = action.payload;
            const existingItem = state.items.find(item => item.part.id === part.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ part, quantity });
            }
        },
        removeFromCart: (state, action) => {
            const partId = action.payload;
            state.items = state.items.filter(item => item.part.id !== partId);
        },
        updateQuantity: (state, action) => {
            const { partId, quantity } = action.payload;
            const existingItem = state.items.find(item => item.part.id === partId);
            if (existingItem) {
                existingItem.quantity = quantity;
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
    state.cart.items.reduce((total, item) => total + item.part.price * item.quantity, 0);

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
