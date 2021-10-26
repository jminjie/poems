'use strict';

const e = React.createElement;

const SERVER = "ws://54.177.197.224:5049";
const LOCALHOST = "ws://localhost:5049";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState : 'unknown',
            poem : 'not set',
            endings : [ "dummy ending 1", "dummy ending 2" ],
        };

        this.ws = new WebSocket(SERVER);
        this.ws.addEventListener("open", () => {
            console.log("Opened websocket");
            this.ws.send(keySuffix() + "join");
        });

        this.ws.addEventListener("message", ({ data }) => {
            console.log(data);
            var state = data.substring(0, 7);
            if (state == "state 0") {
                this.setState({
                    gameState : "0",
                });
            } else if (state == "state 1") {
                this.setState({
                    gameState : "1",
                    poem : data.substring(7),
                });
            } else if (state == "state 2" ) {
                this.setState({
                    gameState : "2",
                    endings : JSON.parse(data.substring(7)),
                });
            } else if (state == "state 3" ) {
                this.setState({
                    gameState : "3",
                    realEnding : JSON.parse(data.substring(7)),
                });
            } else if (state == "numplay") {
                this.setState({
                    numPlayers : JSON.parse(data.substring(7)),
                });
            }
        });

        this.notifyAllSubmissionsIn = this.notifyAllSubmissionsIn.bind(this);
        this.revealAnswer = this.revealAnswer.bind(this);

    }

    async notifyAllSubmissionsIn() {
        // TODO this shouldn't be allowed if no submissions are in.
        this.ws.send(keySuffix() + "all-submissions-in");
    }


    async revealAnswer() {
        this.ws.send(keySuffix() + "reveal");
    }

    render() {
        console.log('game state is rendered with state=' + this.state.gameState);
        if (this.state.gameState == 'unknown') {
            return 'Loading...';
        } else if (this.state.gameState == '0') {
            let poem_elements = [];
            for (let i = 0; i < POEM_NAMES.length; i++) {
                poem_elements.push(e(SubmitPresetPoemButton, ({
                    ws : this.ws,
                    poemName : POEM_NAMES[i],
                    poemBody : POEMS[i],
                    key : i,
                })));
            }
            return e('div', null,
                e('h4', null, "Number of players currently in this game: " + this.state.numPlayers),
                e('h3', null, "Choose a poem"),
                e('div', {className: 'whitebox buttons'},
                    e(SubmitRandomPoemButton, ({
                        ws : this.ws,
                    })),
                    e('br', null),
                    e('br', null),
                poem_elements),
                e('h3', null, "Or submit a new poem"),
                e('div', {className: "whitebox"},
                e(PoemSubmitBox, ({ws : this.ws})),
                )
            );
        } else if (this.state.gameState == '1') {
            return e("div", null, 
                e('h4', null, "Number of players currently in this game: " + this.state.numPlayers),
                e('div', {className: "whitebox"},
                    e("pre", null,
                        e(PoemDisplay, {poem : this.state.poem})),
                    e(EndingSubmitBox, {ws : this.ws}),
                    e(IncrementButton,
                        {onClick : this.notifyAllSubmissionsIn, label : "All submissions are in"}),
                )
            );
        } else if (this.state.gameState == '2') {
            // TODO render voting boxes
            return e('div', null,
                e('h4', null, "Number of players currently in this game: " + this.state.numPlayers),
                e('div', {className: "whitebox"},
                    e("pre", null, e(PoemDisplay, {poem : this.state.poem}),
                        e(SubmissionsList, {submissions : this.state.endings})),
                    e('br'), e(IncrementButton, {
                        onClick : this.revealAnswer,
                        label : "Reveal answer",
                    }
                )));
        } else if (this.state.gameState == '3') {
            return e('div', null,
                e('h4', null, "Number of players currently in this game: " + this.state.numPlayers),
                e('div', {className: "whitebox"},
                    e("pre", null, e(PoemDisplay, {poem : this.state.poem}),
                        e(SubmissionsList, {
                            submissions : this.state.endings,
                            realEnding : this.state.realEnding,
                    })),
                    e('br'), e(IncrementButton, {
                        onClick : this.revealAnswer,
                        disabled: true,
                        label : "Reveal answer",
                    })
                )
            );
        } else {
            return "Game state is invalid =" + this.state.gameState;
        }
    }
}

class SubmissionsList extends React.Component {
    render() {
        if (this.props.submissions == null) {
            return "Loading submissions...";
        }

        // create a copy of submissions so that when render is called many times we don't keep
        // appending the real ending label
        let submissions = []
        for (let i = 0; i < this.props.submissions.length; i++) {
            submissions.push(this.props.submissions[i]);
        }
        // If we know the real ending, point to it
        if (this.props.realEnding != null) {
            submissions[this.props.realEnding] = submissions[this.props.realEnding] + " <------ REAL ENDING"
        }

        var listItems = submissions.map((submission) => e('li', {
            style : {
                "margin" : "0 0 10px 0",
            }
        },
            submission));
        return e('ul', {
            style : {
                "margin" : "20px 0 20px 0",
            }
        },
            listItems);
    }
}

class IncrementButton extends React.Component {
    render() {
        return e('button', {
            onClick : this.props.onClick,
            disabled : this.props.disabled,
        }, this.props.label);
    }
}

class PoemDisplay extends React.Component {
    render() { return this.props.poem; }
}

class SubmitPresetPoemButton extends React.Component {
    constructor(props) {
        super(props);
        this.poemName = this.props.poemName;
        this.poemBody = this.props.poemBody;
        this.ws = this.props.ws;
        this.onPresetSubmitBoxSubmit = this.onPresetSubmitBoxSubmit.bind(this);
    }

    onPresetSubmitBoxSubmit(event) {
        console.log("SubmitPresetPoemButton onPresetSubmitBoxSubmit");
        event.preventDefault();
        this.ws.send(keySuffix() + this.poemName + "\n\n" + this.poemBody);
    }

    render() {
        return e('form', {
            className : 'PresetSubmitForm',
            onSubmit : () => { this.onPresetSubmitBoxSubmit(event) }
        },
            e('button', {type : 'submit'}, this.poemName));
    };
}

class SubmitRandomPoemButton extends SubmitPresetPoemButton {
    constructor(props) {
        super(props);
        let i = Math.floor(Math.random() * POEMS.length);
        this.poemName = POEM_NAMES[i];
        this.poemBody = POEMS[i];
        this.ws = this.props.ws;
        this.onPresetSubmitBoxSubmit = this.onPresetSubmitBoxSubmit.bind(this);
    }

    render() {
        return e('form', {
            className : 'PresetSubmitForm',
            onSubmit : () => { this.onPresetSubmitBoxSubmit(event) }
        },
            e('button', {type : 'submit', className : 'rand'}, "Random poem"));
    };
}


class SubmitBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value : '',
            message : '',
        };
        this.rows = 17;
        this.placeholder = "";
    }

    onSubmitBoxSubmit(event) {
        event.preventDefault();
        console.log("SubmitBox onSubmitBoxSubmit()");
    }

    handleChange(event) {
        this.state.value = event.target.value;
    }

    render() {
        return e('form', {
                className : 'SubmitForm',
                onSubmit : () => { this.onSubmitBoxSubmit(event) }
            },
            e('textarea', {
                onChange : () => { this.handleChange(event) },
                rows : this.rows,
                placeholder : this.placeholder,
            }),
            e('button', {type : 'submit'}, this.label),
            e('div', null, this.state.message));
    }
}

class PoemSubmitBox extends SubmitBox {
    constructor(props) {
        super(props);
        this.label = "Submit custom poem";
        this.ws = this.props.ws;
        this.onSubmitBoxSubmit = this.onSubmitBoxSubmit.bind(this);
        this.placeholder = "Title of poem\n\nFirst stanza of the poem\nGoes like this, we're all alone\nAnd then one night I saw her face\nShining like my mother's vase\n\nSecond stanza goes along\nThere's nothing left when all is gone\nSearch inside yourself to find\nThe limitations of your mind\n\nThe third stanza will be hidden from\nthe players of the game until\nAll endings are in and then\nit will be displayed with the fake endings.";
    }

    onSubmitBoxSubmit(event) {
        event.preventDefault();
        if (this.state.value == "") {
            this.setState({
                message : "Submission cannot be empty.",
            });
        } else if (!this.state.value.includes("\n\n")) {
            this.setState({
                message : "Submission must have at least 2 stanzas.",
            });
        } else {
            this.ws.send(keySuffix() + this.state.value);
            event.target.value = "";
        }
    }
}

class EndingSubmitBox extends SubmitBox {
    constructor(props) {
        super(props);
        this.label = "Submit ending";
        this.rows = 5;
        this.ws = this.props.ws;
        this.placeholder = "Player's custom ending goes here\nMake sure to pay attention to\n    spacing\nand punctuation.";
    }

    onSubmitBoxSubmit(event) {
        event.preventDefault();
        if (this.state.value == "") {
            this.setState({
                message : "Submission cannot be empty.",
            });
        } else {
            this.ws.send(keySuffix() + this.state.value);
            this.setState({
                message : "Submitted",
            });
        }
    }
}

class Start extends React.Component {
    render() {
        // gemerate 6 random chars
        let r = (Math.random().toString(36)+'00000000000000000').slice(2, 6+2)
        return e('h3', {className:"createroom"}, e('a', {href : "/?key=" + r, className: "whitebox"}, "Click here to create a room"));
    }
}

// If no key, generate one or let the user enter
var urlParams = new URLSearchParams(window.location.search);
var entries = urlParams.entries();
var keyFound = false;
for (var pair of entries) {
    if (pair[0] == "key") {
        keyFound = true;
    }
}
// these lines find the like_button_container div and display the react
// component inside it
if (keyFound) {
    const domContainer = document.querySelector('#game');
    ReactDOM.render(e(Game), domContainer);
} else {
    const domContainer = document.querySelector('#game');
    ReactDOM.render(e(Start), domContainer);
}

const POEM_NAMES = [
"Snow-flakes by Longfellow",
"Loneliness by Robert Frost",
"The oft-repeated dream by Robert Frost",
"My November Guest by Robert Frost",
"A Dream by Edgar Allen Poe",
"Poem 632 by Emily Dickenson",
"Good Hours by Robert Frost",
"Bond and Free by Robert Frost",
"Eldorado by Edgar Allen Poe",
"Most Like an Arch This Marriage by John Ciardi",
"Might Have Been July, Might Have Been December by Robert Wrigley",
"Letter from the Estuary by Erik Kennedy",
"The Mushroom is the Elf of Plants by Emily Dickinson",
"Gathering Leaves by Robert Frost",
"In a Disused Graveyard by Robert Frost",
"To E.T. by Robert Frost",
"The Aim Was Song by Robert Frost"
];

const POEMS = [`Out of the bosom of the Air,
      Out of the cloud-folds of her garments shaken,
Over the woodlands brown and bare,
      Over the harvest-fields forsaken,
            Silent, and soft, and slow
            Descends the snow.

Even as our cloudy fancies take
      Suddenly shape in some divine expression,
Even as the troubled heart doth make
      In the white countenance confession,
            The troubled sky reveals
            The grief it feels.

This is the poem of the air,
      Slowly in silent syllables recorded;
This is the secret of despair,
      Long in its cloudy bosom hoarded,
            Now whispered and revealed
            To wood and field.`,
`One ought not to have to care
So much as you and I
Care when the birds come round the house
To seem to say good-bye;

Or care so much when they come back
With whatever it is they sing;
The truth being we are as much
Too glad for the one thing

As we are too sad for the other here—
With birds that fill their breasts
But with each other and themselves
And their built or driven nests.`,
`She had no saying dark enough
For the dark pine that kept
Forever trying the window latch
Of the room where they slept.

The tireless but ineffectual hands
That with every futile pass
Made the great tree seem as a little bird
Before the mystery of glass!

It never had been inside the room,
And only one of the two
Was afraid in an oft-repeated dream
Of what the tree might do.`,
`My sorrow, when she’s here with me,
Thinks these dark days of autumn rain
Are beautiful as days can be;
She loves the bare, the withered tree;
She walks the sodden pasture lane.

Her pleasure will not let me stay.
She talks and I am fain to list:
She’s glad the birds are gone away,
She’s glad her simple worsted grey
Is silver now with clinging mist.

The desolate, deserted trees,
The faded earth, the heavy sky,
The beauties she so truly sees,
She thinks I have no eye for these,
And vexes me for reason why.

Not yesterday I learned to know
The love of bare November days
Before the coming of the snow,
But it were vain to tell her so,
And they are better for her praise.`,
`In visions of the dark night
I have dreamed of joy departed—
But a waking dream of life and light
Hath left me broken-hearted.

Ah! what is not a dream by day
To him whose eyes are cast
On things around him with a ray
Turned back upon the past?

That holy dream—that holy dream,
While all the world were chiding,
Hath cheered me as a lovely beam
A lonely spirit guiding.

What though that light, thro' storm and night,
So trembled from afar—
What could there be more purely bright
In Truth's day-star?`,
`The Brain--is wider than the Sky--
For--put them side by side--
The one the other will contain
With ease--and You--beside

The Brain is deeper than the sea--
For--hold them--Blue to Blue--
The one the other will absorb--
As Sponges--Buckets--do--

The Brain is just the weight of God--
For--Heft them--Pound for Pound--
And they will differ--if they do--
As Syllable from Sound--`,
`I had for my winter evening walk—
No one at all with whom to talk,
But I had the cottages in a row
Up to their shining eyes in snow.

And I thought I had the folk within:
I had the sound of a violin;
I had a glimpse through curtain laces
Of youthful forms and youthful faces.

I had such company outward bound.
I went till there were no cottages found.
I turned and repented, but coming back
I saw no window but that was black.

Over the snow my creaking feet
Disturbed the slumbering village street
Like profanation, by your leave,
At ten o'clock of a winter eve.`,
`Love has earth to which she clings
With hills and circling arms about—
Wall within wall to shut fear out.
But Thought has need of no such things,
For Thought has a pair of dauntless wings.

On snow and sand and turf, I see
Where Love has left a printed trace
With straining in the world’s embrace.
And such is Love and glad to be.
But Thought has shaken his ankles free.

Thought cleaves the interstellar gloom
And sits in Sirius’ disc all night,
Till day makes him retrace his flight,
With smell of burning on every plume,
Back past the sun to an earthly room.

His gains in heaven are what they are.
Yet some say Love by being thrall
And simply staying possesses all
In several beauty that Thought fares far
To find fused in another star.`,
`Gaily bedight,
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

‘Over the Mountains
Of the Moon,
Down the Valley of the Shadow,
Ride, boldly ride,’
The shade replied,—
‘If you seek for Eldorado!’`,
`Most like an arch—an entrance which upholds
and shores the stone-crush up the air like lace.
Mass made idea, and idea held in place.
A lock in time. Inside half-heaven unfolds.

Most like an arch—two weaknesses that lean
into a strength. Two fallings become firm.
Two joined abeyances become a term
naming the fact that teaches fact to mean.

Not quite that? Not much less. World as it is,
what’s strong and separate falters. All I do
at piling stone on stone apart from you
is roofless around nothing. Till we kiss

I am no more than upright and unset.
It is by falling in and in we make
the all-bearing point, for one another’s sake,
in faultless failing, raised by our own weight.`,
`More oblique the eagle’s angle
than the osprey’s precipitous fall,
but rose up both and under them dangled
a trout, the point of it all.

Festooned, a limb on each one’s
favored tree either side of the river,
with chains of bone and lace of skin
the river’s wind made shiver.

Sat under them both, one in December,
one in July, in diametrical seasonal airs,
and once arrived home, as I remember,
with a thin white fish rib lodged in my hair.`,
`Two feet of snow at my parents’ place, in another season.
Here, the cicadas sing like Christian women’s choirs
in a disused cotton mill. Belief is a kind of weather.
I haven’t seen proper snow for three years.

The new urban forest for native plants and birds
will be splendid if the local cats don’t kill the birds.
The problem is, all my sympathies are with the cats.
The friendly disturbers are more endearing than what they disturb.

A trimaran called 3rd Degree spinning around its cable in the channel:
that’s how love is here and should be everywhere.
It seems so unserious or contentedly ironic;
it’s the kind of thing you either look through or ignore.

But you’d be wrong. The question isn’t: Why is love so strange here?
It’s: Why did it feel normal somewhere else?
In quiet places, the present is just gossip about the past.
The future is a critique of that. All my best.`,
`The Mushroom is the Elf of Plants -
At Evening, it is not
At Morning, in a Truffled Hut
It stop opon a Spot

As if it tarried always
And yet it’s whole Career
Is shorter than a Snake’s Delay -
And fleeter than a Tare -

’Tis Vegetation’s Juggler -
The Germ of Alibi -
Doth like a Bubble antedate
And like a Bubble, hie -

I feel as if the Grass was pleased
To have it intermit -
This surreptitious Scion
Of Summer’s circumspect.

Had Nature any supple Face
Or could she one contemn -
Had Nature an Apostate -
That Mushroom - it is Him!`,
`Spades take up leaves
No better than spoons,
And bags full of leaves
Are light as balloons.

I make a great noise
Of rustling all day
Like rabbit and deer
Running away.

But the mountains I raise
Elude my embrace,
Flowing over my arms
And into my face.

I may load and unload
Again and again
Till I fill the whole shed,
And what have I then?

Next to nothing for weight,
And since they grew duller
From contact with earth,
Next to nothing for color.

Next to nothing for use,
But a crop is a crop,
And who’s to say where
The harvest shall stop?`,
`The living come with grassy tread
To read the gravestones on the hill;
The graveyard draws the living still,
But never any more the dead.

The verses in it say and say:
‘The ones who living come today
To read the stones and go away
Tomorrow dead will come to stay.’

So sure of death the marbles rhyme,
Yet can’t help marking all the time
How no one dead will seem to come.
What is it men are shrinking from?

It would be easy to be clever
And tell the stones: Men hate to die
And have stopped dying now forever.
I think they would believe the lie.`,
`I slumbered with your poems on my breast
Spread open as I dropped them half-read through
Like dove wings on a figure on a tomb
To see, if in a dream they brought of you,

I might not have the chance I missed in life
Through some delay, and call you to your face
First soldier, and then poet, and then both,
Who died a soldier-poet of your race.

I meant, you meant, that nothing should remain
Unsaid between us, brother, and this remained—
And one thing more that was not then to say:
The Victory for what it lost and gained.

You went to meet the shell's embrace of fire
On Vimy Ridge; and when you fell that day
The war seemed over more for you than me,
But now for me than you—the other way.

How over, though, for even me who knew
The foe thrust back unsafe beyond the Rhine,
If I was not to speak of it to you
And see you pleased once more with words of mine?`,
    `Before man came to blow it right
     The wind once blew itself untaught,
And did its loudest day and night
     In any rough place where it caught.

Man came to tell it what was wrong:
     It hadn’t found the place to blow;
It blew too hard—the aim was song.
     And listen—how it ought to go!

He took a little in his mouth,
     And held it long enough for north
To be converted into south,
     And then by measure blew it forth.

By measure. It was word and note,
     The wind the wind had meant to be—
A little through the lips and throat.
     The aim was song—the wind could see.`
];
