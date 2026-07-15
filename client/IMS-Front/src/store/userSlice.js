import { createSlice } from '@reduxjs/toolkit';

const initialUsers = [
  {
    id: 'usr-1',
    name: 'Alexandra Cole',
    username: 'a.cole',
    email: 'a.cole@imscore.io',
    role: 'Admin',
    status: 'Active',
    warehouse: 'North Hub',
    lastLogin: '2026-07-07T11:30:00Z',
    createdAt: '2026-01-15T09:00:00Z',
    avatar: 'A',
  },
  {
    id: 'usr-2',
    name: 'Marcus Reid',
    username: 'm.reid',
    email: 'm.reid@imscore.io',
    role: 'Manager',
    status: 'Active',
    warehouse: 'South Wing',
    lastLogin: '2026-07-07T09:15:00Z',
    createdAt: '2026-02-10T10:00:00Z',
    avatar: 'M',
  },
  {
    id: 'usr-3',
    name: 'Sofia Patel',
    username: 's.patel',
    email: 's.patel@imscore.io',
    role: 'Operator',
    status: 'Active',
    warehouse: 'East Depot',
    lastLogin: '2026-07-06T16:45:00Z',
    createdAt: '2026-03-05T08:00:00Z',
    avatar: 'S',
  },
  {
    id: 'usr-4',
    name: 'Jordan Blake',
    username: 'j.blake',
    email: 'j.blake@imscore.io',
    role: 'Operator',
    status: 'Active',
    warehouse: 'North Hub',
    lastLogin: '2026-07-07T10:05:00Z',
    createdAt: '2026-03-20T11:00:00Z',
    avatar: 'J',
  },
  {
    id: 'usr-5',
    name: 'Ethan Marsh',
    username: 'e.marsh',
    email: 'e.marsh@imscore.io',
    role: 'Manager',
    status: 'Inactive',
    warehouse: 'South Wing',
    lastLogin: '2026-06-28T14:00:00Z',
    createdAt: '2026-01-28T09:30:00Z',
    avatar: 'E',
  },
  {
    id: 'usr-6',
    name: 'Nina Vasquez',
    username: 'n.vasquez',
    email: 'n.vasquez@imscore.io',
    role: 'Operator',
    status: 'Active',
    warehouse: 'East Depot',
    lastLogin: '2026-07-07T08:50:00Z',
    createdAt: '2026-04-12T12:00:00Z',
    avatar: 'N',
  },
];

const initialState = {
  items: initialUsers,
  searchQuery: '',
  roleFilter: 'All',
  statusFilter: 'All',
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      const newUser = {
        ...action.payload,
        id: `usr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        avatar: action.payload.name?.[0]?.toUpperCase() || 'U',
      };
      state.items.unshift(newUser);
    },
    updateUser: (state, action) => {
      const index = state.items.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    deleteUser: (state, action) => {
      state.items = state.items.filter((u) => u.id !== action.payload);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
  },
});

export const {
  addUser,
  updateUser,
  deleteUser,
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
} = userSlice.actions;

export default userSlice.reducer;
