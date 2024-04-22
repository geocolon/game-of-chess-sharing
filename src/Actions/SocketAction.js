import {
    SET_WEBSOCKET_CONNECTION,
    RECEIVE_MESSAGE
  } from '../Actions/actionTypes';
export const setWebSocketConnection = (connectionStatus) => ({
    type: SET_WEBSOCKET_CONNECTION,
    payload: connectionStatus,
});

export const receiveMessage = (message) => ({
    type: RECEIVE_MESSAGE,
    payload: message,
});