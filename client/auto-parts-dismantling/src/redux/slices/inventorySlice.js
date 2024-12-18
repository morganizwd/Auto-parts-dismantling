// src/redux/slices/inventorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

// Thunks for Inventory Actions

// Create a new inventory item
export const createInventory = createAsyncThunk(
    'inventory/createInventory',
    async (inventoryData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/inventory', inventoryData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch all inventory items
export const fetchAllInventory = createAsyncThunk(
    'inventory/fetchAllInventory',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/inventory');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch an inventory item by ID
export const fetchInventoryById = createAsyncThunk(
    'inventory/fetchInventoryById',
    async (inventoryId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/inventory/${inventoryId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update an inventory item
export const updateInventory = createAsyncThunk(
    'inventory/updateInventory',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/inventory/${id}`, updatedData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Delete an inventory item
export const deleteInventory = createAsyncThunk(
    'inventory/deleteInventory',
    async (inventoryId, { rejectWithValue }) => {
        try {
            await axios.delete(`/inventory/${inventoryId}`);
            return inventoryId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Initial State
const initialState = {
    inventoryItems: [],
    currentInventory: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Inventory Slice
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
            // Create Inventory
            .addCase(createInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.inventoryItems.push(action.payload);
            })
            .addCase(createInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch All Inventory
            .addCase(fetchAllInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.inventoryItems = action.payload;
            })
            .addCase(fetchAllInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch Inventory by ID
            .addCase(fetchInventoryById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchInventoryById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentInventory = action.payload;
            })
            .addCase(fetchInventoryById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update Inventory
            .addCase(updateInventory.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateInventory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.inventoryItems.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.inventoryItems[index] = action.payload;
                }
                if (state.currentInventory && state.currentInventory.id === action.payload.id) {
                    state.currentInventory = action.payload;
                }
            })
            .addCase(updateInventory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete Inventory
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

// Selectors
export const selectAllInventory = (state) => state.inventory.inventoryItems;
export const selectCurrentInventory = (state) => state.inventory.currentInventory;
export const selectInventoryStatus = (state) => state.inventory.status;
export const selectInventoryError = (state) => state.inventory.error;

// Export Actions and Reducer
export const { clearCurrentInventory } = inventorySlice.actions;
export default inventorySlice.reducer;
