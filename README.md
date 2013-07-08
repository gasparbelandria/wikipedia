# Wikipedia

This plugin in Javascript performs a search in Wikipedia API, which is explained in detail in the following link:

[http://www.mediawiki.org/wiki/API:Main_page](http://www.mediawiki.org/wiki/API:Main_page)

## You can see it running here:
[http://gasparbelandria.com/wikipedia/](http://gasparbelandria.com/wikipedia/)

## Features of the plugin:
* You can choose between more popular database of Wikipedia, I want to clarify that Wikipedia does not work with "languages​​", for this reason it is possible that if you search for example: "massachusetts" on "English" Database, may be different to  "Spanish" and may sometimes not be found in other Databases.
* Use LocalStorage momentarily to store the searches, the LocalStorage is cleaned when re-enter the plugin.
* Has a control for Historic, Back, Next.
* Show topics related to each search.
* If the word you entered is not in the database, try to find the most similar as possible, type "george" and view the functionality.
* Wikipedia also allows you to extract text information only, ideal for low speed connections or mobile devices, if you want to find images related to the search word, Wikipedia only provides the name of the image but not the location on your server, for it we must use md5 to find the location. This is very interesting so I'd like to do a git only this topic.

## Goal
The goal of this script is to compare it with another, with the same functionality, but made with `Backbone` and `Require`.
