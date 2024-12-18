// src/redux/slices/supplierSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

// Thunks for various supplier actions

// 1. Create a new supplier
export const createSupplier = createAsyncThunk(
    'supplier/createSupplier',
    async (supplierData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/suppliers', supplierData);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message);
        }
    }
);

// 2. Fetch all suppliers
export const fetchAllSuppliers = createAsyncThunk(
    'supplier/fetchAllSuppliers',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/suppliers');
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message);
        }
    }
);

// 3. Fetch a supplier by ID
export const fetchSupplierById = createAsyncThunk(
    'supplier/fetchSupplierById',
    async (supplierId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/suppliers/${supplierId}`);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message);
        }
    }
);

// 4. Update a supplier
export const updateSupplier = createAsyncThunk(
    'supplier/updateSupplier',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/suppliers/${id}`, updatedData);
            return data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message);
        }
    }
);

// 5. Delete a supplier
export const deleteSupplier = createAsyncThunk(
    'supplier/deleteSupplier',
    async (supplierId, { rejectWithValue }) => {
        try {
            await axios.delete(`/suppliers/${supplierId}`);
            return supplierId;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            }
            return rejectWithValue(err.message);
        }
    }
);

// Initial state
const initialState = {
    suppliers: [],       // List of all suppliers
    currentSupplier: null, // Details of a single supplier
    status: 'idle',      // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Create the slice
const supplierSlice = createSlice({
    name: 'supplier',
    initialState,
    reducers: {
        // You can add synchronous actions here if needed
        clearCurrentSupplier: (state) => {
            state.currentSupplier = null;
            state.error = null;
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
        // 1. Create Supplier
        builder
            .addCase(createSupplier.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createSupplier.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.suppliers.push(action.payload);
            })
            .addCase(createSupplier.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // 2. Fetch All Suppliers
            .addCase(fetchAllSuppliers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.suppliers = action.payload;
            })
            .addCase(fetchAllSuppliers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // 3. Fetch Supplier by ID
            .addCase(fetchSupplierById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSupplierById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentSupplier = action.payload;
            })
            .addCase(fetchSupplierById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // 4. Update Supplier
            .addCase(updateSupplier.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateSupplier.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
                if (index !== -1) {
                    state.suppliers[index] = action.payload;
                }
                if (state.currentSupplier && state.currentSupplier.id === action.payload.id) {
                    state.currentSupplier = action.payload;
                }
            })
            .addCase(updateSupplier.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // 5. Delete Supplier
            .addCase(deleteSupplier.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteSupplier.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
                if (state.currentSupplier && state.currentSupplier.id === action.payload) {
                    state.currentSupplier = null;
                }
            })
            .addCase(deleteSupplier.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

// Selectors
export const selectAllSuppliers = (state) => state.supplier.suppliers;
export const selectCurrentSupplier = (state) => state.supplier.currentSupplier;
export const selectSupplierStatus = (state) => state.supplier.status;
export const selectSupplierError = (state) => state.supplier.error;

// Export actions and reducer
export const { clearCurrentSupplier } = supplierSlice.actions;
export default supplierSlice.reducer;