var gameState;

const SERVER_URL = 'http://192.168.86.84:8080/';

const GAME_STATE_URL = 'getGameState';
const INCREMENT_URL = 'nextState';

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

function incrementGameState() {
   return postData(SERVER_URL + INCREMENT_URL);
}

const POEM = `
Gaily bedight,
   A gallant knight, 
In sunshine and in shadow,   
   Had journeyed long,   
   Singing a song, 
In search of Eldorado. 

   But he grew old— 
   This knight so bold—   
And o’er his heart a shadow—   
   Fell as he found 
   No spot of ground 
That looked like Eldorado. 

   And, as his strength   
   Failed him at length, 
He met a pilgrim shadow—   
   ‘Shadow,’ said he,   
   ‘Where can it be— 
This land of Eldorado?’ 
`;

function getPoem() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(POEM);
        }, 1000);
    });
}
