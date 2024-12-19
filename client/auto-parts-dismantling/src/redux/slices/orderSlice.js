// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

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

const initialState = {
    orders: [],
    currentOrder: null,
    status: 'idle', 
    error: null,
};

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

export const selectAllOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrderStatus = (state) => state.orders.status;
export const selectOrderError = (state) => state.orders.error;

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;