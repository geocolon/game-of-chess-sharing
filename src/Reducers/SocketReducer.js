import { SET_WEBSOCKET_CONNECTION, RECEIVE_MESSAGE } from '../Actions/actionTypes';

const initialState = {
    webSocketConnected: false,
    messages: [],
};

const SocketReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_WEBSOCKET_CONNECTION:
            return {
                ...state,
                webSocketConnected: action.payload,
            };
        case RECEIVE_MESSAGE:
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        default:
            return state;
    }
};

export default SocketReducer;