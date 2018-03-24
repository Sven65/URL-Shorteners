/* Golang URL Shortener.
Copyright (c) Mackan, <mackan@discorddungeons.me>
*/

package main

import (
	"fmt"
	"net/http"
	"flag"
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"strconv"
	"time"
	"encoding/json"
	"crypto/rand"
	"encoding/base64"
)

var (
	id int
	URL string
	Short string
	CreatedAt []uint8
	Title string
	Clicked int

	Shrt string
)

func getToken(c int) string{
	b := make([]byte, c)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	return base64.StdEncoding.EncodeToString(b)
}

func sendErr(EPage *ErrorPage, w http.ResponseWriter){ 
	res, _ := json.Marshal(EPage) // JSON encode the ErrorPage
	w.WriteHeader(EPage.HTTPStatus) // Send the status code in the EPage
	fmt.Fprintf(w, "%s", res) // Print the JSON
}

func handle(w http.ResponseWriter, r *http.Request){

	db, err := sql.Open("mysql", "root:@/url") // Connect to database
	if err != nil { log.Fatal(err.Error()) } // If there's an error
	defer db.Close()

	err = db.Ping() // Check if connected

	if err != nil { log.Fatal(err.Error()) } // If not

	switch r.Method {
		case "GET": // GET Request
			Shrt = r.URL.Path[1:] // Get the shortcode
			err = db.QueryRow("SELECT id, URL, Short, CreatedAt, Title, Clicked FROM `links` WHERE `Short` = ?", Shrt).Scan(&id, &URL, &Short, &CreatedAt, &Title, &Clicked) // Get a row from db and put the fields into variables

			switch {
				case err == sql.ErrNoRows: // If there's no rows
					http.Error(w, "Invalid link", 404) // Return a 404
				case err != nil: // If there's an error
					http.Error(w, err.Error(), 500) // Return a 500
				default: // Otherwise
					_, err = db.Exec("UPDATE `links` SET `Clicked` = ? WHERE `Short` = ?", Clicked+1, Short) // Add one to 'Clicked' in the row the shortcode is a part of
					if err != nil { http.Error(w, err.Error(), 500) } // If there's an error send a 500
					http.Redirect(w, r, URL, 302) // Redirect the user to the URL with a 302
			}
		case "POST": // POST Request
			decoder := json.NewDecoder(r.Body) // JSON Decode the body
			var lnk LinkPost // Get a new variable of the 'LinkPost' struct
			err := decoder.Decode(&lnk) // Decode the body into the struct
			if err != nil { http.Error(w, err.Error(), 500) } // If it fails, return a 500 error

			err = db.QueryRow("SELECT id, URL, Short, CreatedAt, Title, Clicked FROM `links` WHERE `URL` = ?", lnk.URL).Scan(&id, &URL, &Short, &CreatedAt, &Title, &Clicked) // Try to get the row of the URL, to see if it exists

			switch {
				case err == sql.ErrNoRows: // No rows (it doesn't exist)
					t := strconv.FormatInt(int64(time.Now().Unix()), 36) // Get the current UNIX timestamp to a base36 string
					oc := getToken(33)
					_, err := db.Exec("INSERT INTO `links` (`URL`, `Short`, `Title`, `Token`) VALUES (?, ?, ?, ?)", lnk.URL, t, lnk.Title, oc) // Insert it into the 'links' table
					if err != nil { // If it fails
						http.Error(w, err.Error(), 500) // Return a 500
					}
					resp := &CreatedResponse{
						HTTPStatus: 200,
						URL: lnk.URL,
						Title: lnk.Title,
						Short: t,
						Token: oc} // Get a new struct of the 'CreatedResponse'
					res, _ := json.Marshal(resp) // JSON Encode the data
					w.WriteHeader(200) // Write a 200 'OK' status code
					fmt.Fprintf(w, "%s", res) // Write the JSON to the client
				case err != nil: // If there's an error
					http.Error(w, err.Error(), 500) // Return a 500
				default: // If the link exists
					resp := &CreatedResponseF{ // Treat it like it's created new, but insert the existing shortcode instead of a new
						HTTPStatus: 200,
						URL: URL,
						Title: Title,
						Short: Short}
					res, _ := json.Marshal(resp) // JSON Encode the data
					w.WriteHeader(200) // Write a 200 'OK' status code
					fmt.Fprintf(w, "%s", res) // Write the JSON to the client
			}

		case "DELETE":
			resp := &ErrorPage{HTTPStatus: 501, Message: "Method Not Allowed"}
			sendErr(resp, w)
		case "PATCH":
			decoder := json.NewDecoder(r.Body)
			var data patchReq
			err := decoder.Decode(&data)
			if err != nil { http.Error(w, err.Error(), 500) } // If it fails, return a 500 error
			
			

		default: // Other requests
			resp := &ErrorPage{HTTPStatus: 405, Message: "Method Not Allowed"}
			sendErr(resp, w)
	}
}

func main(){
	port := flag.Int("port", 8080, "The port to listen to") // Self explanatory

	flag.Parse() // Parse the flags

	http.HandleFunc("/", handle) // Handle the root
	fmt.Printf("Listening on port %d", *port) // Print serving
	http.ListenAndServe(fmt.Sprintf(":%d",*port), nil) // Listen for requests
}
