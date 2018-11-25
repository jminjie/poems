const SERVER_URL = 'http://192.168.86.84:8080/';

const GAME_STATE_URL = 'getGameState';
const INCREMENT_URL = 'nextState';
const SUBMIT_POEM_URL = 'submitFullPoem';
const POEM_URL = 'getPoem';
const SUBMIT_ENDING_URL = 'submitEnding';

// just for testing
const TEST_MODE = false;

function setGameState(state) {
    testGameState = state
}
var testGameStatePromise = {
    json() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(testGameState);
            }, 500);
        });
    }
};
var testPoemPromise = {
    json() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(TEST_POEM);
            }, 500);
        });
    }
};
const TEST_POEM = `Gaily bedight,
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
This land of Eldorado?’`;
// end of testing section


function getGameState() {
    if (!TEST_MODE) {
        return fetch(SERVER_URL + GAME_STATE_URL);
    } else {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(testGameStatePromise);
            }, 500);
        });
    }
}

function getPoem() {
    if (!TEST_MODE) {
        return fetch(SERVER_URL + POEM_URL);
    } else {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(testPoemPromise);
            }, 500);
        });
    }
}

function incrementGameState() {
   return fetch(SERVER_URL + INCREMENT_URL);
}

function sendPoemRequest(submission) {
    if (!TEST_MODE) {
        return fetch(SERVER_URL + SUBMIT_POEM_URL,
            { method: "POST", body: submission });
    }
}

function sendEndingRequest(ending) {
    if (!TEST_MODE) {
        return fetch(SERVER_URL + SUBMIT_ENDING_URL,
            { method: "POST", body: ending });
    }
}
