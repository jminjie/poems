const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 5049 });

game_state = 0;

poem = "poem not yet set";
poem_start = "";
true_ending = "true ending not yet set";
poem_endings = new Set()
all_players = new Set()
shuffled_endings = [];

wss.on("connection", ws => {
    all_players.add(ws);

    ws.on("message", data => {
        // TODO get room code and pass into handleData
        handleData(data, ws);
    })

    ws.on("close", () => {
        all_players.delete(ws);
    })
});

function handleData(data, ws) {
    // first handle special messages
    if (data == "join") {
        console.log("There are now " + all_players.size + " players");
        if (game_state == 0) {
            ws.send("state " + game_state);
        } else if (game_state == 1) {
            ws.send("state " + game_state + poem_start);
        } else if (game_state == 2) {
            ws.send("state " + game_state + JSON.stringify(endings_to_shuffle));
        } else if (game_state == 3) {
            ws.send("state " + game_state + true_ending_index);
        }
        return;
    } else if (data == "all-submissions-in" && game_state == 1) {
        game_state++;
        prepareAllEndings();
        for (let player of all_players.values()) {
            player.send("state " + game_state + JSON.stringify(endings_to_shuffle));
        }
        return;
    } else if (data == "reveal" && game_state == 2) {
        game_state++;
        for (let player of all_players.values()) {
            player.send("state " + game_state + true_ending_index);
        }
        return;
    }

    // depending on game state, handle long-form messages
    if (game_state == 0) {
        // message should be the poem in state 0
        console.log("Poem start received: " + data);
        poem = data;
        setPoemStartAndTrueEnd(poem);
        game_state++;
        for (let player of all_players.values()) {
            player.send("state " + game_state + poem_start);
        }
    } else if (game_state == 1) {
        // message should be endings in state 1
        console.log("Poem ending received: " + data);
        poem_endings.add(data);
    }
}

function setPoemStartAndTrueEnd(poem) {
    stanzas = poem.split("\n\n");
    for (i = 0; i < stanzas.length - 1; i++) {
        poem_start += stanzas[i];
        poem_start += "\n\n";
    }
    true_ending = stanzas[stanzas.length - 1];
}

function prepareAllEndings() {
    endings_to_shuffle = Array.from(poem_endings);
    shuffleArray(endings_to_shuffle);
    true_ending_index = Math.floor(Math.random() * endings_to_shuffle.length + 1);
    endings_to_shuffle.splice(true_ending_index, 0, true_ending)

    console.log("true_ending_index=" + true_ending_index);
    console.log("shuffled endings=" + endings_to_shuffle);
    shuffled_endings = endings_to_shuffle;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

