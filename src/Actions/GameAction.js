import axios from 'axios';
import {
  POST_GAME_REQUEST,
  POST_GAME_SUCCESS,
  POST_GAME_FAILURE,
  SET_GAME_ID,
  SET_USERNAME_SUBMITTED,
  SET_USERNAME
} from './actionTypes';

export const setUsername = (username) => ({
  type: SET_USERNAME,
  payload: username
});

export const setUsernameSubmitted = (submitted) => ({
  type: SET_USERNAME_SUBMITTED,
  payload: submitted
});

export const createGameRequest = () => ({
  type: POST_GAME_REQUEST
});

export const createGameSuccess = (gameId) => ({
  type: POST_GAME_SUCCESS,
  payload: gameId
});

export const createGameFailure = (error) => ({
  type: POST_GAME_FAILURE,
  payload: error
});

export const setGameId = (gameId) => ({
  type: SET_GAME_ID,
  payload: gameId
});

export const createGame = (Player1, Player2) => async (dispatch) => {
  try {
    // Check if player names are empty or null
    if (!Player1 || !Player2) {
      throw new Error('Player names cannot be empty');
    }

    // Check the format of the request body
    if (typeof Player1 !== 'string' || typeof Player2 !== 'string') {
      throw new Error('Invalid request body format');
    }

    dispatch(setUsername(Player1)); // Dispatch action to set player1
    dispatch(setUsernameSubmitted(true)); // Dispatch action to set usernameSubmitted to true


    // Make the API call to save the player names
    dispatch(createGameRequest()); // Dispatch request action
    const response = await axios.post('http://localhost:8080/games',
      {
        Player1,
        Player2,
        Moves: [],
        GameName: `${Player1} & ${Player2}`
      });
    console.log('Response data:', response.data); // Log the response data
    dispatch(createGameSuccess(response.data.id)); // Dispatch with gameId
    dispatch(setGameId(response.data.id)); // Dispatch with gameId
    dispatch({ type: createGameSuccess, payload: response.data });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Axios error response
      const axiosError = error;
      const errorMessage = axiosError.response?.data || 'Unknown error occurred';
      console.error('Error saving player names:', errorMessage);
      dispatch({ type: createGameFailure, payload: errorMessage });
    } else {
      // Other errors
      console.error('Error saving player names:', error.message);
      dispatch({ type: createGameFailure, payload: error.message });
    }
  }
};