// src/redux/slices/favoriteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

// Thunks for Favorite Actions

// Add a favorite part
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

// Fetch all favorite parts
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

// Remove a favorite part
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

// Initial State
const initialState = {
    favorites: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Favorite Slice
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
            // Add Favorite
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

            // Fetch Favorites
            .addCase(fetchFavorites.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.favorites = action.payload;
            })
            .addCase(fetchFavorites.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Remove Favorite
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

// Selectors
export const selectAllFavorites = (state) => state.favorites.favorites;
export const selectFavoriteStatus = (state) => state.favorites.status;
export const selectFavoriteError = (state) => state.favorites.error;

// Export Actions and Reducer
export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
