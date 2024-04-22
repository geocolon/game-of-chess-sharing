import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './Reducers/GameReducer';
import SocketReducer from './Reducers/SocketReducer';
import { Socket } from 'socket.io-client';

const rootReducer = configureStore({
  reducer: {
    game: gameReducer,
    socket: SocketReducer,
    // Add other reducers here if you have them
  },
});

export default rootReducer;