var gameState;

const SERVER_URL = 'http://192.168.86.84:8080/';

const GAME_STATE_URL = 'getGameState';
const INCREMENT_URL = 'nextState';
const SUBMIT_POEM_URL = 'submitFullPoem';
const POEM_URL = 'getPoem';

// just for testing
function setGameState(state) {
    gameState = state
}

function getGameState() {
    return fetch(SERVER_URL + GAME_STATE_URL);
    /*
    // Contact the server to get the game state. For now we wait 1 second
    // and return 0
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(gameState);
        }, 1000);
    });
    */
}

function getPoem() {
    return fetch(SERVER_URL + POEM_URL);
}

function incrementGameState() {
   return fetch(SERVER_URL + INCREMENT_URL);
}

function sendPoemRequest(submission) {
    return fetch(SERVER_URL + SUBMIT_POEM_URL,
        {
            method: "POST",
            body: submission
        });
}
