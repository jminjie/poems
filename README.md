# The Poems Game
A Balderdash-style game for poetry.

![Recorded demo](https://github.com/jminjie/poems/blob/master/new-demo.gif)

## Rules to the game
- First you can create a room or invite others to a created room by sharing the link.

- Choose an existing poem or input your own -- stanzas should be separated by a blank line.

- Then read the first n-1 stanzas of the poem (the last stanza is automatically hidden for you).

- Spend 10-15 minutes writing your own versions of the last stanza. It's useful to have a time cap here especially if you have some perfectionists in your group. Once everyone has submitted their version (remember to pay attention to formatting and indentation), one person hits the "All submission are in" button.

- All ending submissions will be displayed in a random order (everyone gets the same order). Read them and talk about them.

- Hit the "reveal" button to see the real ending.

## Demo
Play the demo at https://poems.jminjie.com

## Development
To run the server on localhost:5049 run `node node-server/index.js debug`.

To run the client serve it over localhost with `python -m SimpleHTTPServer` or `python3 -m http.server`.

The game should be accessible at localhost:8000.
