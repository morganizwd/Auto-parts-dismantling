// src/redux/slices/favoriteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

export const addFavorite = createAsyncThunk(
    'favorites/addFavorite',
    async (partId, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/favorites', { part_id: partId });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const fetchFavorites = createAsyncThunk(
    'favorites/fetchFavorites',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/favorites');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

export const removeFavorite = createAsyncThunk(
    'favorites/removeFavorite',
    async (partId, { rejectWithValue }) => {
        try {
            await axios.delete(`/favorites/${partId}`);
            return partId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

const initialState = {
    favorites: [],
    status: 'idle', 
    error: null,
};

const favoriteSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        clearFavorites: (state) => {
            state.favorites = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addFavorite.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addFavorite.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.favorites.push(action.payload);
            })
            .addCase(addFavorite.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(fetchFavorites.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.favorites = action.payload.favorites; 
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(removeFavorite.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(removeFavorite.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.favorites = state.favorites.filter(fav => fav.part_id !== action.payload);
            })
            .addCase(removeFavorite.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const selectAllFavorites = (state) => state.favorites.favorites;
export const selectFavoriteStatus = (state) => state.favorites.status;
export const selectFavoriteError = (state) => state.favorites.error;

export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
