import { Container, TextField } from "@mui/material";
import Game from "./Game";
import CustomDialog from "./components/CustomDialog";
import { useDispatch, useSelector } from 'react-redux';
import { setUsername, setUsernameSubmitted } from './Actions/GameAction';

export default function App() {
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
        handleContinue={handleContinue}
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
      <Game />
    </Container>
  );
}