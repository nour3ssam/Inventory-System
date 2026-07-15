import { createSlice } from '@reduxjs/toolkit';

const initialTransfers = [
  {
    id: 'trn-1',
    transferCode: 'TRN-2910',
    product: 'Quantum CPU Core',
    sku: 'SKU-2910',
    fromWarehouse: 'North Hub',
    toWarehouse: 'East Depot',
    quantity: 20,
    status: 'Completed',
    initiatedBy: 'Alexandra Cole',
    notes: 'Rebalancing inventory after Q2 audit.',
    createdAt: '2026-07-05T10:30:00Z',
    completedAt: '2026-07-06T14:00:00Z',
  },
  {
    id: 'trn-2',
    transferCode: 'TRN-3829',
    product: 'Neon Plasma Tubing',
    sku: 'SKU-3829',
    fromWarehouse: 'South Wing',
    toWarehouse: 'North Hub',
    quantity: 5,
    status: 'In Transit',
    initiatedBy: 'Marcus Reid',
    notes: 'Urgent replenishment for production line.',
    createdAt: '2026-07-06T08:15:00Z',
    completedAt: null,
  },
  {
    id: 'trn-3',
    transferCode: 'TRN-1049',
    product: 'Carbon Fiber Chassis',
    sku: 'SKU-1049',
    fromWarehouse: 'East Depot',
    toWarehouse: 'South Wing',
    quantity: 10,
    status: 'Completed',
    initiatedBy: 'Sofia Patel',
    notes: 'Scheduled monthly rotation.',
    createdAt: '2026-07-04T11:00:00Z',
    completedAt: '2026-07-04T18:30:00Z',
  },
  {
    id: 'trn-4',
    transferCode: 'TRN-5521',
    product: 'Fiber Optic Loom',
    sku: 'SKU-5521',
    fromWarehouse: 'East Depot',
    toWarehouse: 'North Hub',
    quantity: 30,
    status: 'Pending',
    initiatedBy: 'Jordan Blake',
    notes: 'Awaiting approval from warehouse manager.',
    createdAt: '2026-07-07T09:00:00Z',
    completedAt: null,
  },
  {
    id: 'trn-5',
    transferCode: 'TRN-8840',
    product: 'Lithium Power Pack',
    sku: 'SKU-8840',
    fromWarehouse: 'North Hub',
    toWarehouse: 'South Wing',
    quantity: 15,
    status: 'Completed',
    initiatedBy: 'Alexandra Cole',
    notes: 'Critical restock — zero units at South Wing.',
    createdAt: '2026-07-03T13:45:00Z',
    completedAt: '2026-07-03T17:20:00Z',
  },
  {
    id: 'trn-6',
    transferCode: 'TRN-4752',
    product: 'Cryogenic Coolant',
    sku: 'SKU-4752',
    fromWarehouse: 'South Wing',
    toWarehouse: 'East Depot',
    quantity: 40,
    status: 'Cancelled',
    initiatedBy: 'Marcus Reid',
    notes: 'Transfer cancelled due to supplier re-delivery.',
    createdAt: '2026-07-02T10:00:00Z',
    completedAt: null,
  },
];

const initialState = {
  items: initialTransfers,
  searchQuery: '',
  statusFilter: 'All',
  warehouseFilter: 'All',
};

const transferSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    addTransfer: (state, action) => {
      const newTransfer = {
        ...action.payload,
        id: `trn-${Date.now()}`,
        transferCode: `TRN-${Math.floor(Math.random() * 9000) + 1000}`,
        createdAt: new Date().toISOString(),
        completedAt: null,
        status: 'Pending',
      };
      state.items.unshift(newTransfer);
    },
    updateTransferStatus: (state, action) => {
      const { id, status } = action.payload;
      const index = state.items.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.items[index].status = status;
        if (status === 'Completed') {
          state.items[index].completedAt = new Date().toISOString();
        }
      }
    },
    deleteTransfer: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setWarehouseFilter: (state, action) => {
      state.warehouseFilter = action.payload;
    },
  },
});

export const {
  addTransfer,
  updateTransferStatus,
  deleteTransfer,
  setSearchQuery,
  setStatusFilter,
  setWarehouseFilter,
} = transferSlice.actions;

export default transferSlice.reducer;
