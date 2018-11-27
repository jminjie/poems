'use strict';

const e = React.createElement;
// 0 = submit the poem
// 1 = submit your own ending
// 2 = see all submissions and vote
// 3 = see results
// TODO this is just for testing
setGameState(1);

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: 'unknown',
            poem: 'not set',
            endings: ["dummy ending 1", "dummy ending 2"],
        };
        this.refresh();
    }

    componentDidMount() {
        this.timer = setInterval(()=> this.refresh(), 2000);
    }

    componentWillUnmount() {
        this.timer = null;
    }

    async refresh() {
        console.log("refreshing");
        var oldState = this.state.gameState;
        await this.asyncGetGameState();
        if (oldState != this.state.gameState) {
            // TODO check the state first
            this.asyncGetPoem();
            this.asyncGetEndings();
            this.asyncGetRealEnding();
        }
    }

    handleAsyncError(error) {
        console.log("handleAsyncError: error=" + error);
    }

    async asyncGetGameState() {
        console.log("asyncGetGameState");
        let result = await getGameState();
        let resultText = await result.text();
        if (this.state.gameState != resultText) {
            this.setState({
                gameState: resultText,
            });
        }
    }

    async asyncGetPoem() {
        console.log("asyncGetPoem");
        let result = await getPoem();
        let resultText = await result.text();
        this.setState({
            poem: resultText,
        });
    }

    async asyncGetEndings() {
        console.log("asyncGetEndings");
        let result = await getEndings();
        let resultJson = await result.json();
        this.setState({
            endings: this.shuffle(resultJson['endings']),
        });
    }

    async asyncGetRealEnding() {
        console.log("asyncGetRealEnding");
        let result = await getRealEnding();
        let resultText = await result.text();
        this.setState({
            realEnding: resultText,
        });
    }

    async asyncIncrement() {
        console.log("asyncIncrement");
        var result = await incrementGameState();
        result.catch(handleAsyncError);
        let resultJson = await result.json();
        resultJson.catch(handleAsyncError);
        this.setState({
            gameState: JSON.stringify(resultJson),
        });
    }

    shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    render() {
        console.log('game state is rendered with state=' + this.state.gameState);
        if (this.state.gameState == 'unknown') {
            return 'Loading...';
        } else if (this.state.gameState == '0') {
            var submitBox = new PoemSubmitBox({afterSubmit: this.asyncIncrement});
            return submitBox.render();
        } else if (this.state.gameState == '1') {
            return e("pre", null,
                e(PoemDisplay, {poem: this.state.poem}),
                e(EndingSubmitBox),
                e(IncrementButton, {
                    onClick: this.asyncIncrement,
                    label: "All submissions are in"}),
            );
        } else if (this.state.gameState == '2') {
            // TODO render voting boxes
            return e('div', null,
                e("pre", null,
                e(PoemDisplay, {poem: this.state.poem}),
                e(SubmissionsList, {submissions: this.state.endings})),
                e('br'),
                e(IncrementButton, {
                    onClick: this.asyncIncrement,
                    label: "Reveal answer",
                })
            );
        } else if (this.state.gameState == '3') {
            return e('div', null,
                e("pre", null,
                e(PoemDisplay, {poem: this.state.poem}),
                e(SubmissionsList, {
                    submissions: this.state.endings,
                    realEnding: this.state.realEnding,
                })),
            );
        } else {
            return "Game state is invalid =" + this.state.gameState;
        }
    }
}

class SubmissionsList extends React.Component {
    render() {
        let submissions = this.props.submissions;
        if (submissions == null) {
            return "Loading submissions...";
        }

        // If we know the real ending, point to it
        if (this.props.realEnding != null) {
            for (let i = 0; i < submissions.length; i++) {
                if (submissions[i] == this.props.realEnding) {
                    console.log("found real ending at i=" + i);
                    submissions[i] = submissions[i] + " <------ REAL ENDING"
                }
            }
        }

        var listItems = submissions.map(
            (submission) => e('li', {style: {
                "margin": "0 0 10px 0",
            }}, submission)
        );
        return e('ul', {style: {
            "margin": "20px 0 20px 0",
        }}, listItems);
    }
}

class IncrementButton extends React.Component {
    render() {
        return e('button', {onClick: this.props.onClick}, this.props.label);
    }
}

class PoemDisplay extends React.Component {
    render() {
        // TODO temp log
        console.log(this.props.poem);
        return this.props.poem;
    }
}

class SubmitBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            message: '',
        };
        this.rows = 15;
        this.cols = 60;
    }

    onSubmitBoxSubmit(event) {
        event.preventDefault();
        console.log("SubmitBox onSubmitBoxSubmit()");
    }

    handleChange(event) {
        console.log("handleChange, value=" + event.target.value);
        this.state.value = event.target.value;
    }

    render() {
        return e(
            'form', {
                className: 'SubmitForm',
                onSubmit: () => {this.onSubmitBoxSubmit(event)}
            },
            e('textarea', {
                onChange: () => {this.handleChange(event)},
                rows: this.rows,
                cols: this.cols,
            }),
            e('br'),
            e('button', {type: 'submit'}, this.label),
            e('div', null, this.state.message)
        );
    }
}

class PoemSubmitBox extends SubmitBox {
    constructor(props) {
        super(props);
        this.label = "Submit poem";
        this.afterSubmit = this.props.afterSubmit;
        this.onSubmitBoxSubmit = this.onSubmitBoxSubmit.bind(this);
    }

    sendPoem() {
        console.log("sending poem=" + this.state.value);
        sendPoemRequest(this.state.value);
    }

    onSubmitBoxSubmit(event) {
        event.preventDefault();
        this.sendPoem();
        this.afterSubmit();
    }
}

class EndingSubmitBox extends SubmitBox {
    constructor(props) {
        super(props);
        this.label = "Submit ending";
        this.rows = 5;
    }

    sendEnding() {
        console.log("sending ending=" + this.state.value);
        sendEndingRequest(this.state.value);
        // TODO check for success
        this.setState({
            message: "Submitted",
        });
    }

    onSubmitBoxSubmit(event) {
        event.preventDefault();
        this.sendEnding();
    }
}

// these lines find the like_button_container div and display the react
// component inside it
const domContainer = document.querySelector('#game');
ReactDOM.render(e(Game), domContainer);
