package main

import (
  "fmt"
  "net/http"
  "io/ioutil"
)

func main() {
  url := "http://localhost:8080/pets/<string>"
  
  req, _ := http.NewRequest("GET", url, nil)
  
  res, _ := http.DefaultClient.Do(req)
  defer res.Body.Close()
  body, _ := ioutil.ReadAll(res.Body)

  fmt.Println(res)
  fmt.Println(string(body))
}