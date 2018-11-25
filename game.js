'use strict';

const e = React.createElement;
// 0 = submit the poem
// 1 = submit your own ending
// 2 = see all submissions and vote
// 3 = see results
// TODO this is just for testing
setGameState('0');

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: 'unknown',
            poem: 'not set',
        };
        this.asyncGetGameState()
    }

    async asyncGetGameState() {
        console.log("asyncGetGameState");
        let result = await getGameState();
        let resultJson = await result.json();
        this.setState({
            gameState: JSON.stringify(resultJson),
        });
    }

    async asyncGetPoem() {
        var result = await getPoem();
        this.setState({
            poem: result,
        });
    }

    async asyncIncrement() {
        var result = await incrementGameState();
        let resultJson = await result.json();
        this.setState({
            gameState: JSON.stringify(resultJson),
        });
        console.log("Incremented state");
    }

    render() {
        console.log('game state is rendered with state=' + this.state.gameState);
        if (this.state.gameState == 'unknown') {
            return 'Game state is ' + this.state.gameState;
        } else if (this.state.gameState == '0') {
            var submitBox = new PoemSubmitBox();
            submitBox.setOnSubmit(() => {
                    this.asyncIncrement;
                });
            return submitBox.render();
        } else if (this.state.gameState == '1') {
            return [new PoemDisplay(this.state.poem).render(),
                new EndingSubmitBox().render()
            ];
        } else if (this.state.gameState == '2') {
            // render all submissions
            // render voting boxes
        } else if (this.state.gameState == '3') {
            // render answer
            // render winner
        } else {
            return "Game state is invalid =" + this.state.gameState;
        }
    }
}

class PoemDisplay extends React.Component {
    render() {
        return this.props.poem;
    }
}

class SubmitBox extends React.Component {
    constructor(props) {
        super(props);
    }

    onSubmitBoxSubmit() {
        console.log("SubmitBox#onSubmitBoxSubmit()");
    }

    render() {
        return [
            e('textarea', {key: "text"}, null),
            e('br', {key: "br"}, null),
            e(
                'button',
                { onClick: () => {this.onSubmitBoxSubmit()}, key: "button", },
                this.label,
            )
        ];
    }
}

class EndingSubmitBox extends SubmitBox {
    constructor(props) {
        super(props);
        this.label = "Submit ending";
    }
}

class PoemSubmitBox extends SubmitBox {
    constructor(props, onSubmit) {
        super(props);
        this.label = "Submit poem";
    }

    setOnSubmit(onSubmit) {
        this.submitMethod = onSubmit;
    }

    onSubmitBoxSubmit() {
        console.log("PoemSubmitBox#onSubmitBoxSubmit");
        this.submitMethod();
    }
}


// these lines find the like_button_container div and display the react
// component inside it
const domContainer = document.querySelector('#game');
ReactDOM.render(e(Game), domContainer);
