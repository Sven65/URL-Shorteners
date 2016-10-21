/* Golang URL Shortener.
Copyright (c) Mackan, <thormax5@gmail.com>
*/

package main

type LinkPost struct{
	URL string
	Title string
}

type CreatedResponse struct{
	HTTPStatus int
	URL string
	Title string
	Short string
	Token string
}

type CreatedResponseF struct{
	HTTPStatus int
	URL string
	Title string
	Short string
}

type ErrorPage struct{
	HTTPStatus int
	Message string
}

type patchReq struct {
	Short string
	Token string
	Title string
	URL string
}