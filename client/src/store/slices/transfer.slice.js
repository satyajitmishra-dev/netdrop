import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    peers: [],
    activeTab: 'local', // 'local' | 'remote'
    myDevice: null,
    connectionStatus: 'disconnected', // 'disconnected' | 'connecting' | 'connected'
};

const transferSlice = createSlice({
    name: 'transfer',
    initialState,
    reducers: {
        setPeers: (state, action) => {
            state.peers = action.payload;
        },
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },
        setMyDevice: (state, action) => {
            state.myDevice = action.payload;
        },
        setConnectionStatus: (state, action) => {
            state.connectionStatus = action.payload;
        },
        addPeer: (state, action) => {
            const exists = state.peers.find(p => p.id === action.payload.id);
            if (!exists) state.peers.push(action.payload);
        },
        removePeer: (state, action) => {
            state.peers = state.peers.filter(p => p.id !== action.payload);
        }
    },
});

export const { setPeers, setActiveTab, setMyDevice, setConnectionStatus, addPeer, removePeer } = transferSlice.actions;
export default transferSlice.reducer;
