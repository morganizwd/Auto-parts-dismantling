// src/redux/slices/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

// Thunks for Review Actions

// Create a new review
export const createReview = createAsyncThunk(
    'reviews/createReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const { data } = await axios.post('/reviews', reviewData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch all reviews
export const fetchAllReviews = createAsyncThunk(
    'reviews/fetchAllReviews',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get('/reviews');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Fetch a review by ID
export const fetchReviewById = createAsyncThunk(
    'reviews/fetchReviewById',
    async (reviewId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`/reviews/${reviewId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Update a review
export const updateReview = createAsyncThunk(
    'reviews/updateReview',
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`/reviews/${id}`, updatedData);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Delete a review
export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async (reviewId, { rejectWithValue }) => {
        try {
            await axios.delete(`/reviews/${reviewId}`);
            return reviewId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// Initial State
const initialState = {
    reviews: [],
    currentReview: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Review Slice
const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearCurrentReview: (state) => {
            state.currentReview = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Review
            .addCase(createReview.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reviews.push(action.payload);
            })
            .addCase(createReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch All Reviews
            .addCase(fetchAllReviews.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllReviews.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reviews = action.payload;
            })
            .addCase(fetchAllReviews.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Fetch Review by ID
            .addCase(fetchReviewById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchReviewById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentReview = action.payload;
            })
            .addCase(fetchReviewById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update Review
            .addCase(updateReview.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateReview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.reviews.findIndex(review => review.id === action.payload.id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
                if (state.currentReview && state.currentReview.id === action.payload.id) {
                    state.currentReview = action.payload;
                }
            })
            .addCase(updateReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete Review
            .addCase(deleteReview.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.reviews = state.reviews.filter(review => review.id !== action.payload);
                if (state.currentReview && state.currentReview.id === action.payload) {
                    state.currentReview = null;
                }
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

// Selectors
export const selectAllReviews = (state) => state.reviews.reviews;
export const selectCurrentReview = (state) => state.reviews.currentReview;
export const selectReviewStatus = (state) => state.reviews.status;
export const selectReviewError = (state) => state.reviews.error;

// Export Actions and Reducer
export const { clearCurrentReview } = reviewSlice.actions;
export default reviewSlice.reducer;
