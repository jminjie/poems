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
            endingsJson: {"endings": ["dummy ending 1", "dummy ending 2"]},
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
            endingsJson: resultJson,
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
                e(IncrementButton, {onClick: this.asyncIncrement})
            );
        } else if (this.state.gameState == '2') {
            // TODO render voting boxes
            var submissions = this.state.endingsJson["endings"];
            return e("pre", null,
                e(PoemDisplay, {poem: this.state.poem}),
                e(SubmissionsList, {submissions: submissions})
            );
        } else if (this.state.gameState == '3') {
            // TODO render answer
            // TODO render winner
            return "gameState is 3";
        } else {
            return "Game state is invalid =" + this.state.gameState;
        }
    }
}

class SubmissionsList extends React.Component {
    constructor(props) {
        super(props);
        this.listItems = props.submissions.map(
            (submission) => e('li', null, submission)
        );
    }

    render() {
        return e('ul', null, this.listItems);
    }
}

class IncrementButton extends React.Component {
    render() {
        return e('button', {onClick: this.props.onClick}, "All submissions are in.");
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
        this.state = {value: ''};
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
            e('button', {type: 'submit'}, this.label)
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
