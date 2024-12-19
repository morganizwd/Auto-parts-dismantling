// src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../axios';

export const register = createAsyncThunk('user/register', async (params, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/users/register', params);
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

export const login = createAsyncThunk('user/login', async (params, { rejectWithValue }) => {
    try {
        const { data } = await axios.post('/users/login', params); 
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

export const fetchCurrentUser = createAsyncThunk('user/fetchCurrentUser', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/users/profile'); 
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

export const updateUser = createAsyncThunk('user/updateUser', async (formData, { rejectWithValue }) => {
    try {
        const { data } = await axios.put('/users/profile', formData); 
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

export const deleteUser = createAsyncThunk('user/deleteUser', async (_, { rejectWithValue }) => {
    try {
        await axios.delete('/users/profile');
        return;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

export const fetchAllUsers = createAsyncThunk('user/fetchAllUsers', async (_, { rejectWithValue }) => {
    try {
        const { data } = await axios.get('/users/');
        return data;
    } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            return rejectWithValue(err.response.data.message);
        } else {
            return rejectWithValue(err.message);
        }
    }
});

export const fetchUserById = createAsyncThunk('user/fetchUserById', async (userId, { rejectWithValue }) => {
    try {
        const { data } = await axios.get(`/users/${userId}`);
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
    user: null,       
    users: [],          
    status: 'idle',     
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.status = 'idle';
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.user.role); 
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
                state.user = action.payload.user;
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('role', action.payload.user.role); 
                axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            .addCase(fetchCurrentUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user; 
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            .addCase(updateUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload.user; 
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

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

            .addCase(fetchAllUsers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload.users; 
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            .addCase(fetchUserById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const user = action.payload.user; 
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

export const selectIsAuth = (state) => Boolean(state.user.user);
export const selectCurrentUser = (state) => state.user.user;
export const selectAllUsers = (state) => state.user.users;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;

export const { logout } = userSlice.actions;
export default userSlice.reducer;
