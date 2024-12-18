// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

// Thunks for various actions

// Register a new user
export const register = createAsyncThunk('user/register', async (params, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/register', params);
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

// Login user
export const login = createAsyncThunk('user/login', async (params, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/login', params);
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

// Fetch current authenticated user
export const fetchCurrentUser = createAsyncThunk('user/fetchCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/profile');
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

// Update current user
export const updateUser = createAsyncThunk('user/updateUser', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put('/profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

// Delete current user
export const deleteUser = createAsyncThunk('user/deleteUser', async (_, { rejectWithValue }) => {
    try {
        await axios.delete('/profile');
        return;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

// Fetch all users
export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/');
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

// Fetch user by ID
export const fetchUserById = createAsyncThunk('user/fetchUserById', async (userId, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/${userId}`);
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

const initialState = {
    user: null,          // Current authenticated user
    users: [],           // List of all users
    status: 'idle',      // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Create the slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // Logout action
        logout: (state) => {
            state.user = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                localStorage.setItem('token', action.payload.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Login
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
                localStorage.setItem('token', action.payload.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Fetch Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Update User
            .addCase(updateUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state) => {
                state.status = 'succeeded';
                state.user = null;
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Fetch All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Fetch User by ID
            .addCase(fetchUserById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const user = action.payload;
                const existingUser = state.users.find((u) => u.id === user.id);
                if (existingUser) {
                    Object.assign(existingUser, user);
                } else {
                    state.users.push(user);
                }
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

// Selectors
export const selectIsAuth = (state) => Boolean(state.user.user);
export const selectCurrentUser = (state) => state.user.user;
export const selectAllUsers = (state) => state.user.users;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;

// Export actions and reducer
export const { logout } = userSlice.actions;
export default userSlice.reducer;