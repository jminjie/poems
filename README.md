# The Poems Game
A Balderdash-style game for poetry.

To run the client open the index.html file in your browser, or serve it over localhost with `python -m SimpleHTTPServer` or for python 3 `python -m http.server`.
The client also needs a room key of the form `<server>/?key=SOMEKEY`.

To run the server on port 8080 run `go run server/main.go -port 8080`.

Make sure the hardcoded IP in the client matches the current IP of the server. You can scan for active hosts on the wifi with `nmap -sn 192.168.86.0/24`.

## Rules to the game
- First you can create a room or invite others to a created room by sharing the link.

- Choose an existing poem or input your own -- stanzas should be separated by a blank line.

- Then read the first n-1 stanzas of the poem (the last stanza is automatically hidden for you).

- Spend 10-15 minutes writing your own versions of the last stanza. It's useful to have a time cap here especially if you have some perfectionists in your group. Once everyone has submitted their version (remember to pay attention to formatting and indentation), one person hits the "All submission are in" button.

- All ending submissions will be displayed in a random order (currently the order varies by client, but it would be nice to randomize the order on the server). Read them and talk about them.

- Hit the "reveal" button to see the real ending.

## Demo
See the demo at http://poems.jminjie.com (note that HTTPS is not currently supported).
