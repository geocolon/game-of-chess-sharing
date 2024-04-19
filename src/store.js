import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './Reducers/GameReducer';

const rootReducer = configureStore({
  reducer: {
    game: gameReducer,
    // Add other reducers here if you have them
  },
});

export default rootReducer;