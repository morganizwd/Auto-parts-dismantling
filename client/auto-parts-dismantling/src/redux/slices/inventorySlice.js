// src/redux/slices/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

export const createInventory = createAsyncThunk(
    'inventory/createInventory',
    async (inventoryData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/inventories', inventoryData); 
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchAllInventory = createAsyncThunk(
    'inventory/fetchAllInventory',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/inventories'); 
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchInventoryById = createAsyncThunk(
    'inventory/fetchInventoryById',
    async (inventoryId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/inventories/${inventoryId}`); 
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const updateInventory = createAsyncThunk(
    'inventory/updateInventory',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/inventories/${id}`, updatedData); 
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const deleteInventory = createAsyncThunk(
    'inventory/deleteInventory',
    async (inventoryId, { rejectWithValue }) => {
        try {
            await axios.delete(`/inventories/${inventoryId}`); 
            return inventoryId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const initialState = {
    inventoryItems: [],
    currentInventory: null,
    total: 0,
    page: 1,
    pages: 1,
    status: 'idle', 
    error: null,
};

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {
        clearCurrentInventory: (state) => {
            state.currentInventory = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.inventoryItems.push(action.payload.inventory);
            })
            .addCase(createInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchAllInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.inventoryItems = action.payload.inventories; 
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchAllInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchInventoryById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchInventoryById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentInventory = action.payload.inventory; 
            })
            .addCase(fetchInventoryById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedItem = action.payload.inventory;
                const index = state.inventoryItems.findIndex(item => item.id === updatedItem.id);
                if (index !== -1) {
                    state.inventoryItems[index] = updatedItem;
                }
                if (state.currentInventory && state.currentInventory.id === updatedItem.id) {
                    state.currentInventory = updatedItem;
                }
            })
            .addCase(updateInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(deleteInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.inventoryItems = state.inventoryItems.filter(item => item.id !== action.payload);
                if (state.currentInventory && state.currentInventory.id === action.payload) {
                    state.currentInventory = null;
                }
            })
            .addCase(deleteInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const selectAllInventory = (state) => state.inventory.inventoryItems;
export const selectCurrentInventory = (state) => state.inventory.currentInventory;
export const selectInventoryStatus = (state) => state.inventory.status;
export const selectInventoryError = (state) => state.inventory.error;

export const { clearCurrentInventory } = inventorySlice.actions;
export default inventorySlice.reducer;
