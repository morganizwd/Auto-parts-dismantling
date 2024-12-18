// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

// Thunks for Order Actions

// Create a new order
export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/orders', orderData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch all orders
export const fetchOrders = createAsyncThunk(
    'orders/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/orders');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch an order by ID
export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/orders/${orderId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/orders/${id}/status`, { status });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Cancel an order
export const cancelOrder = createAsyncThunk(
    'orders/cancelOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/orders/${orderId}/cancel`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Initial State
const initialState = {
    orders: [],
    currentOrder: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Order Slice
const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders.push(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch All Orders
            .addCase(fetchOrders.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch Order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update Order Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedOrder = action.payload;
                const index = state.orders.findIndex(order => order.id === updatedOrder.id);
                if (index !== -1) {
                    state.orders[index] = updatedOrder;
                }
                if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
                    state.currentOrder = updatedOrder;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Cancel Order
            .addCase(cancelOrder.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const canceledOrder = action.payload;
                const index = state.orders.findIndex(order => order.id === canceledOrder.id);
                if (index !== -1) {
                    state.orders[index] = canceledOrder;
                }
                if (state.currentOrder && state.currentOrder.id === canceledOrder.id) {
                    state.currentOrder = canceledOrder;
                }
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

// Selectors
export const selectAllOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;

// Export Actions and Reducer
export const { clearCurrentOrder } = orderSlice.ac
export default orderSlice.reducer;