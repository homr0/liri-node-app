# LIRI Bot

LIRI is a *Language Interpretation and Recognition Interface*.

## Commands

- ```node liri.js concert-this <band or artist name>```
  - ![concert-this no query](assets/images/concert-none.PNG)
    ![concert-this example using "Panic at the Disco"](assets/images/concert-example.PNG)
  - Returns a list of concerts that the band will be performing with the days and venues from Bandsintown.
- ```node liri.js spotify-this-song <song name>```
  - ![spotify-this-song no query](assets/images/song-none.PNG)
    ![spotify-this-song example using "I Can't Decide"](assets/images/song-example.PNG)
  - Returns a list of songs with their album and artists based off of the song title from Spotify.
- ```node liri.js movie-this <movie name>```
  - ![movie-this no query](assets/images/movie-none.PNG)
    ![movie-this example using "The Grand Budapest Hotel"](assets/images/movie-example.PNG)
  - Returns movie information (including year released, IMDB and Rotten Tomatoes ratings, country, language, plot, and actors) for a movie from OMDb.
- ```node liri.js do-what-it-says```
  - ![do-what-it-says outputs for the song "I Want it That Way"](assets/images/random-1.PNG) ![do-what-it-says outputs for concerts for the Four Seasons, and the movie "Black Panther"](assets/images/random-4.PNG)
  - Returns random information for bands, songs, and movies.