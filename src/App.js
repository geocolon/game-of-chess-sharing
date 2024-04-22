import React, { useEffect } from "react";
import{ Container, TextField } from "@mui/material";
import Game from "./Game";
import CustomDialog from "./components/CustomDialog";
import { useDispatch, useSelector, connect } from 'react-redux';
import io from 'socket.io-client';
import { setWebSocketConnection, receiveMessage } from './Actions/SocketAction';
import { setUsername, setUsernameSubmitted } from './Actions/GameAction';

const socket = io('http://localhost:8080');

const App = ({ webSocketConnected, messages, setWebSocketConnection, receiveMessage }) => {
  useEffect(() => {
    socket.on('connect', () => {
        setWebSocketConnection(true);
    });

    socket.on('message', (data) => {
        receiveMessage(data);
    });

    socket.on('disconnect', () => {
        setWebSocketConnection(false);
    });

    return () => {
        socket.disconnect();
    };
  }, [])

  const sendMessage = () => {
    const data = { message: 'Hello from client' }; // Data to be sent
    socket.emit('message', 'Hello from client');
};

  const player1 = useSelector(state => state.player1);
  const usernameSubmitted = useSelector(state => state.usernameSubmitted);
  const dispatch = useDispatch();
  

  const handleUsernameChange = (e) => {
    dispatch(setUsername(e.target.value));
  };

  const handleContinue = () => {
    if (!player1) {
      console.log("Username not entered. Please enter a username.");
      return;
    }
    console.log("Sending username to server:", player1);
    // Assuming you have socket.io or any other logic here
    dispatch(setUsernameSubmitted(true));
  };

  return (
    <Container>
      <CustomDialog
        open={!usernameSubmitted} // Leave open if username has not been selected
        title="Pick a username" // Title of dialog
        contentText="Please select a username" // Content text of dialog
        handleContinue={handleContinue()}
      >
        <TextField // Input
          autoFocus // Automatically set focus on input (make it active).
          margin="dense"
          id="player1"
          label="Player1"
          name="Player1"
          value={player1}
          required
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => {
            console.log("Username changed:", e.target.value);
            handleUsernameChange(e); // Update username state with value
          }}
          
        />
      </CustomDialog>
      <div>
            {webSocketConnected ? (
                <div>
                    <button onClick={sendMessage}>Send Message</button>
                    <ul>
                        {messages.map((message, index) => (
                            <li key={index}>{message}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>WebSocket disconnected</div>
            )}
        </div>
      <Game />
    </Container>
  );
}

const mapStateToProps = (state) => ({
  webSocketConnected: state.webSocketConnected,
  messages: state.messages,
});

const mapDispatchToProps = {
  setWebSocketConnection,
  receiveMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);