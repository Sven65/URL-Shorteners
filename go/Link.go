/* Golang URL Shortener.
Copyright (c) Mackan, <thormax5@gmail.com>
*/
package main

type Link struct{
	id int
	URL string
	Short string
	CreatedAt string
	Title string
	Clicked int
}