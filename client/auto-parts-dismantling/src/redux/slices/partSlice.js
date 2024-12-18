// src/redux/slices/partSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

// Thunks for Part Actions

// Create a new part
export const createPart = createAsyncThunk(
    'parts/createPart',
    async (partData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/parts', partData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch all parts
export const fetchAllParts = createAsyncThunk(
    'parts/fetchAllParts',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/parts');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch a part by ID
export const fetchPartById = createAsyncThunk(
    'parts/fetchPartById',
    async (partId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/parts/${partId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update a part
export const updatePart = createAsyncThunk(
    'parts/updatePart',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/parts/${id}`, updatedData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Delete a part
export const deletePart = createAsyncThunk(
    'parts/deletePart',
    async (partId, { rejectWithValue }) => {
        try {
            await axios.delete(`/parts/${partId}`);
            return partId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Initial State
const initialState = {
    parts: [],
    currentPart: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Part Slice
const partSlice = createSlice({
    name: 'parts',
    initialState,
    reducers: {
        clearCurrentPart: (state) => {
            state.currentPart = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Part
            .addCase(createPart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createPart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.parts.push(action.payload);
            })
            .addCase(createPart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch All Parts
            .addCase(fetchAllParts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllParts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.parts = action.payload;
            })
            .addCase(fetchAllParts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch Part by ID
            .addCase(fetchPartById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPartById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentPart = action.payload;
            })
            .addCase(fetchPartById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update Part
            .addCase(updatePart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updatePart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.parts.findIndex(part => part.id === action.payload.id);
                if (index !== -1) {
                    state.parts[index] = action.payload;
                }
                if (state.currentPart && state.currentPart.id === action.payload.id) {
                    state.currentPart = action.payload;
                }
            })
            .addCase(updatePart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete Part
            .addCase(deletePart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deletePart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.parts = state.parts.filter(part => part.id !== action.payload);
                if (state.currentPart && state.currentPart.id === action.payload) {
                    state.currentPart = null;
                }
            })
            .addCase(deletePart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

// Selectors
export const selectAllParts = (state) => state.parts.parts;
export const selectCurrentPart = (state) => state.parts.currentPart;
export const selectPartStatus = (state) => state.parts.status;
export const selectPartError = (state) => state.parts.error;

// Export Actions and Reducer
export const { clearCurrentPart } = partSlice.actions;
export default partSlice.reducer;
