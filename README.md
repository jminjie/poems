# Poems
The poems game!

To run the client open the index.html file in your browser, or serve it over localhost with `python -m SimpleHTTPServer` or for python 3 `python -m http.server`.
The client also needs a room key of the form `<server>/?key=SOMEKEY`.

To run the server on port 8080 run `go run server/main.go -port 8080`.

Make sure the hardcoded IP in the client matches the current IP of the server. You can scan for active hosts on the wifi with `nmap -sn 192.168.86.0/24`.

See the demo at http://poems.jminjie.com (note that HTTPS is not currently supported).
