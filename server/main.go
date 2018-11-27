package main
import (
  "net/http"
  "strings"
  "strconv"
  "io/ioutil"
  "fmt"
  "flag"
  "encoding/json"
  //  "errors"
)

var STATE_POEM_SUBMISSION = 0
var STATE_VERSE_SUBMISSION = 1
var STATE_VERSE_VOTE = 2
var STATE_POEM_REVEAL = 3

var currentGameState = 0
var fullPoem = "No poem selected yet"
var hiddenPoem []string
var poemStart string
var poemRealEnding string
var endings []string

// Flags
var portvar int
func init() {
     flag.IntVar(&portvar, "port", 8080, "help message for flagname")
}

func enableCors(w *http.ResponseWriter) {
     (*w).Header().Set("Access-Control-Allow-Origin", "*")
}

// Splits poem into start and ending and store them in poemStart and poemRealEnding.
// Returns false if error occurs.
func parsePoem(poem string) bool {
  var emptyLineIdxs []int
  poem = strings.TrimSpace(poem)
  var poemLines = strings.Split(poem, "\n")
  fmt.Print(strings.Join(poemLines, ", "))
  for i:= 0; i < len(poemLines); i++ {
      if len(poemLines[i]) == 0 {
      	 emptyLineIdxs = append(emptyLineIdxs, i)
      }     	 
  }
  
  if len(emptyLineIdxs) < 1 {
    fmt.Print("poem doesn't have any empty lines")
    return false
  }

  // what's the last stanza?
  // it should be the last new line after which there are non-empty lines.
  lineBreakIdxToUse := emptyLineIdxs[len(emptyLineIdxs)-1]
  poemStart = strings.Join(poemLines[0:lineBreakIdxToUse], "\n") + "\n"
  poemRealEnding = strings.Join(poemLines[lineBreakIdxToUse+1:], "\n")
  return true
}

func submitFullPoemHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  body, _ := ioutil.ReadAll(r.Body)
  fullPoem = string(body)
  parsePoem(fullPoem)
  w.Write([]byte(poemStart))
}

func getGameStateHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  w.Write([]byte(strconv.Itoa(currentGameState)))
}

// DEPRECATED
func nextStateHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  currentGameState += 1
  if (currentGameState >= 4) {
    currentGameState = 0
  }
}

func setStateHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
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
  currentGameState = state
}

func submitEndingHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  body, _ := ioutil.ReadAll(r.Body)
  endings = append(endings, string(body))
}

func getPoemHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  w.Write([]byte(poemStart))
}

func getEndingsHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  resp := make(map[string] []string)
  resp["endings"] = append(resp["endings"], poemRealEnding)
  for _, ending := range endings {
    resp["endings"] = append(resp["endings"], ending)
  }
  bytes, _ := json.Marshal(resp)
  w.Write(bytes)
}

func getRealEndingHandler(w http.ResponseWriter, r *http.Request) {
  enableCors(&w)
  w.Write([]byte(poemRealEnding))
}

func main() {
  flag.Parse()
  http.HandleFunc("/getGameState", getGameStateHandler)
  http.HandleFunc("/submitFullPoem", submitFullPoemHandler)
  http.HandleFunc("/nextState", nextStateHandler)
  http.HandleFunc("/setState", setStateHandler)
  http.HandleFunc("/submitEnding", submitEndingHandler)
  http.HandleFunc("/getPoem", getPoemHandler)
  http.HandleFunc("/getEndings", getEndingsHandler)
  http.HandleFunc("/getRealEnding", getRealEndingHandler)

  if err := http.ListenAndServe(":"+strconv.Itoa(portvar), nil); err != nil {
    panic(err)
  }
}
