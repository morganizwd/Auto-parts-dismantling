// src/redux/slices/partSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

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

export const fetchAllParts = createAsyncThunk(
    'parts/fetchAllParts',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axios.get('/parts', { params });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

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

export const fetchSimilarParts = createAsyncThunk(
    'parts/fetchSimilarParts',
    async (compatibility, { rejectWithValue }) => {
        try {
            const response = await axios.get('/parts', {
                params: {
                    compatibility, 
                    limit: 5,
                },
            });
            return response.data.parts;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

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

const initialState = {
    parts: [],
    currentPart: null,
    total: 0,
    page: 1,
    pages: 1,
    status: 'idle', 
    error: null,
};

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
            .addCase(createPart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createPart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.parts.push(action.payload.part);
            })
            .addCase(createPart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchAllParts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllParts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.parts = action.payload.parts; 
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(fetchAllParts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchPartById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPartById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentPart = action.payload.part;
            })
            .addCase(fetchPartById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updatePart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updatePart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.parts.findIndex(part => part.id === action.payload.part.id);
                if (index !== -1) {
                    state.parts[index] = action.payload.part;
                }
                if (state.currentPart && state.currentPart.id === action.payload.part.id) {
                    state.currentPart = action.payload.part;
                }
            })
            .addCase(updatePart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

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
            })

            .addCase(fetchSimilarParts.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSimilarParts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.similarParts = action.payload;
            })
            .addCase(fetchSimilarParts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const selectAllParts = (state) => state.parts.parts;
export const selectCurrentPart = (state) => state.parts.currentPart;
export const selectPartStatus = (state) => state.parts.status;
export const selectPartError = (state) => state.parts.error;
export const selectSimilarParts = (state) => state.parts.similarParts;

export const { clearCurrentPart } = partSlice.actions;
export default partSlice.reducer;
