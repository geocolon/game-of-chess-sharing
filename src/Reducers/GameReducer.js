
const initialState = {
  player1: '',
  usernameSubmitted: false
}; 
const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USERNAME':
      return {
        ...state,
        player1: action.payload
      };
    case 'SET_USERNAME_SUBMITTED':
      return {
        ...state,
        usernameSubmitted: action.payload
      };
    case 'CREATE_GAME':
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default gameReducer;