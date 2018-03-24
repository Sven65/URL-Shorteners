/* Golang URL Shortener.
Copyright (c) Mackan, <mackan@discorddungeons.me>
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
