// src/redux/slices/supplierSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

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

const initialState = {
    suppliers: [],           
    total: 0,            
    page: 1,               
    pages: 1,                
    currentSupplier: null,  
    status: 'idle',        
    error: null,
};

const supplierSlice = createSlice({
    name: 'supplier',
    initialState,
    reducers: {
        clearCurrentSupplier: (state) => {
            state.currentSupplier = null;
            state.error = null;
            state.status = 'idle';
        },
    },
    extraReducers: (builder) => {
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

            .addCase(fetchAllSuppliers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllSuppliers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.suppliers = action.payload.suppliers;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchAllSuppliers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

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

export const selectAllSuppliers = (state) => state.suppliers.suppliers;
export const selectCurrentSupplier = (state) => state.suppliers.currentSupplier;
export const selectSupplierStatus = (state) => state.suppliers.status;
export const selectSupplierError = (state) => state.suppliers.error;

export const { clearCurrentSupplier } = supplierSlice.actions;
export default supplierSlice.reducer;
