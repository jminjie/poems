package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
)

var STATE_POEM_SUBMISSION = 0
var STATE_VERSE_SUBMISSION = 1
var STATE_VERSE_VOTE = 2
var STATE_POEM_REVEAL = 3

// each of the following globals represent some state of the game, keyed by
// game key
var currentGameState = make(map[string]int)
var fullPoem = make(map[string]string)
var poemStart = make(map[string]string)
var poemRealEnding = make(map[string]string)
var endings = make(map[string][]string)

// Flags
var portvar int

func init() {
	flag.IntVar(&portvar, "port", 8080, "help message for flagname")
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func getKeyFromRequest(r *http.Request) (string, error) {
	keys, ok := r.URL.Query()["key"]
	if !ok || len(keys) != 1 {
		return "", errors.New("Missing url query param 'key'")
	}
	key := keys[0]
	return key, nil
}

// Splits poem into start and ending and store them in poemStart and
// poemRealEnding. Returns false if error occurs.
func parsePoem(poem string, key string) bool {
	var emptyLineIdxs []int
	poem = strings.TrimSpace(poem)
	var poemLines = strings.Split(poem, "\n")
	fmt.Print(strings.Join(poemLines, ", "))
	for i := 0; i < len(poemLines); i++ {
		if len(poemLines[i]) == 0 {
			emptyLineIdxs = append(emptyLineIdxs, i)
		}
	}

	if len(emptyLineIdxs) < 1 {
		fmt.Print("poem doesn't have any empty lines")
		return false
	}

	// what's the last stanza?
	// it should be the last new line after which there are non-empty
	// lines.
	lineBreakIdxToUse := emptyLineIdxs[len(emptyLineIdxs)-1]
	poemStart[key] = strings.Join(poemLines[0:lineBreakIdxToUse], "\n") + "\n"
	poemRealEnding[key] = strings.Join(poemLines[lineBreakIdxToUse+1:], "\n")
	return true
}

func submitFullPoemHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	fmt.Print("key:" + key)
	body, _ := ioutil.ReadAll(r.Body)
	fullPoem[key] = string(body)
	parsePoem(fullPoem[key], key)
	w.Write([]byte(poemStart[key]))
}

func getGameStateHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	w.Write([]byte(strconv.Itoa(currentGameState[key])))
}

func setStateHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Print("setStateHandler")
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	body, readErr := ioutil.ReadAll(r.Body)
	if readErr != nil {
		return
	}
	state, err := strconv.Atoi(string(body))
	if err != nil {
		return
	}
	if state < 0 || state > 4 {
		return
	}
	currentGameState[key] = state
	fmt.Print("setStateHandler state=", currentGameState[key])
	if currentGameState[key] == 2 {
		endings[key] = append(endings[key], poemRealEnding[key])
		shuffleEndings(key)
	}
}

func shuffleEndings(key string) {
	a := endings[key]
	rand.Shuffle(len(a), func(i, j int) { a[i], a[j] = a[j], a[i] })
	endings[key] = a
	fmt.Print("shuffling now, a=", a)
}

func submitEndingHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	body, _ := ioutil.ReadAll(r.Body)
	endings[key] = append(endings[key], string(body))
}

func getPoemHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	w.Write([]byte(poemStart[key]))
}

func getEndingsHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	resp := make(map[string][]string)
	for _, ending := range endings[key] {
		resp["endings"] = append(resp["endings"], ending)
	}
	bytes, _ := json.Marshal(resp)
	w.Write(bytes)
}

func getRealEndingHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	key, _ := getKeyFromRequest(r)
	w.Write([]byte(poemRealEnding[key]))
}

func main() {
	flag.Parse()
	http.HandleFunc("/getGameState", getGameStateHandler)
	http.HandleFunc("/submitFullPoem", submitFullPoemHandler)
	http.HandleFunc("/setState", setStateHandler)
	http.HandleFunc("/submitEnding", submitEndingHandler)
	http.HandleFunc("/getPoem", getPoemHandler)
	http.HandleFunc("/getEndings", getEndingsHandler)
	http.HandleFunc("/getRealEnding", getRealEndingHandler)

	if err := http.ListenAndServe(":"+strconv.Itoa(portvar), nil); err != nil {
		panic(err)
	}
}
