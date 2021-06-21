const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 5049 });

class Game {
    // Game states are as follows:
    // 0 = players are submitting the poem, or chosing a preset poem
    // 1 = players are submitting their own endings
    // 2 = players are looking at all submissions
    // 3 = players are looking at results

    constructor() {
        this.state = 0;
        this.poem = "poem not yet set";
        this.poem_start = "";
        this.true_ending = "true ending not yet set";
        this.poem_endings = new Set()
        this.all_players = new Set()
        this.shuffled_endings = [];
        this.true_ending_index = -1;
    }

    setPoemStartAndTrueEnd() {
        var stanzas = this.poem.split("\n\n");
        for (let i = 0; i < stanzas.length - 1; i++) {
            this.poem_start += stanzas[i];
            this.poem_start += "\n\n";
        }
        this.true_ending = stanzas[stanzas.length - 1];
    }

    prepareAllEndings() {
        var endings_to_shuffle = Array.from(this.poem_endings);
        shuffleArray(endings_to_shuffle);
        this.true_ending_index = Math.floor(Math.random() * endings_to_shuffle.length + 1);
        endings_to_shuffle.splice(this.true_ending_index, 0, this.true_ending)
        this.shuffled_endings = endings_to_shuffle;
    }

    handleData(data, ws) {
        // first handle special messages
        if (data == "join") {
            this.all_players.add(ws);
            sendNumPlayersToAllPlayers(this.all_players);
            if (this.state == 0) {
                ws.send("state " + this.state);
            } else if (this.state == 1) {
                ws.send("state " + this.state + this.poem_start);
            } else if (this.state == 2) {
                // if players joins late or refresh the page, we need to repopulate poem_start
                ws.send("state 1" + this.poem_start);
                ws.send("state " + this.state + JSON.stringify(this.shuffled_endings));
            } else if (this.state == 3) {
                // if players joins late or refresh the page, we need to
                // repopulate poem_start and endings
                ws.send("state 1" + this.poem_start);
                ws.send("state 2" + this.state + JSON.stringify(this.shuffled_endings));
                ws.send("state " + this.state + this.true_ending_index);
            }
            return;
        } else if (data == "all-submissions-in" && this.state == 1) {
            this.state++;
            this.prepareAllEndings();
            for (let player of this.all_players.values()) {
                player.send("state " + this.state + JSON.stringify(this.shuffled_endings));
            }
            return;
        } else if (data == "reveal" && this.state == 2) {
            this.state++;
            for (let player of this.all_players.values()) {
                player.send("state " + this.state + this.true_ending_index);
            }
            return;
        }

        // depending on game state, handle long-form messages
        if (this.state == 0) {
            // message should be the poem in state 0
            this.poem = data;
            this.setPoemStartAndTrueEnd();
            this.state++;
            for (let player of this.all_players.values()) {
                player.send("state " + this.state + this.poem_start);
            }
        } else if (this.state == 1) {
            // message should be endings in state 1
            this.poem_endings.add(data);
        }
    }

}

let all_games = new Map();

wss.on("connection", ws => {
    ws.on("message", data => {
        room = data.substring(0, 6);
        data_for_room = data.substring(6);
        if (!all_games.has(room)) {
            all_games.set(room, new Game());
            console.log("Creating new game. There are now " + all_games.size + " active games.");
        }
        all_games.get(room).handleData(data_for_room, ws);
    })

    // On disconnect since we don't have the room code, scan through all games
    // to remove the player, allowing the garbage collector to clean up the
    // unused memory
    function removePlayer(value, key, map) {
        if (value.all_players.has(ws)) {
            value.all_players.delete(ws);
            sendNumPlayersToAllPlayers(value.all_players);
            if (value.all_players.size == 0) {
                console.log("All players left game " + key + ". Deleting room.");
                all_games.delete(key);
            }
        }
    }
    ws.on("close", () => {
        all_games.forEach(removePlayer);
    })
});

function sendNumPlayersToAllPlayers(players_set) {
    for (let player of players_set.values()) {
        player.send("numplay" + players_set.size);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

