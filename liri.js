// Global environment variables
require("dotenv").config();
var Spotify = require("node-spotify-api");
var request = require("request");
var moment = require("moment");
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);

var cmd = process.argv[2];
var query = process.argv[3];

console.log("---");

if(cmd == "concert-this") {
    // Gets a concert for an artist or band using Bands In Town
    request("https://rest.bandsintown.com/artists/" + query + "/events?app_id=codingbootcamp", function(error, response, body) {
        if(error == null) {
            var concerts = JSON.parse(body);

            for(var i = 0; i < concerts.length; i++) {
                let venue = concerts[i].venue;

                // Name of the venue
                console.log("Venue: " + venue.name);

                // Venue Location
                console.log("Location: " + venue.city + ", " + venue.country);

                // Date of the Event
                console.log("Date: " + moment(concerts[i].datetime).format("MM/DD/YYYY"));
                
                console.log("---");
            }
        } else {
            console.log("Error: " + error);
        }
    });
} else if(cmd == "spotify-this-song") {
    // Finds a song from Spotify.
    // If no song is put, then we will look for "The Sign" by Ace of Base.
    if(query == undefined) {
        query = "The Sign";
    }

    spotify.search({
        type: "track",
        query: query
    }).then(function(data) {
        let songs = data.tracks.items;

        for(var i = 0; i < songs.length; i++) {
            // Artist(s)
            let artists = songs[i].artists;
            let arr = [];
            for(let j = 0; j < artists.length; j++) {
                arr.push(artists[j].name);
            }
            console.log("Artist(s): " + arr.join(", "));

            // Name of song
            console.log("Name: " + songs[i].name);

            // A preview link of the song from Spotify
            console.log("Preview URL: " + songs[i].preview_url);

            // The album that the song is from
            console.log("Album: " + songs[i].album.name)

            console.log("---");
        }
    }).catch(function(err) {
        console.log("Error: " + err);
    });
} else if(cmd == "movie-this") {
    // Finds a movie using OMDb
    // If no query is put, then it will use Mr. Nobody.
    if(query == undefined) {
        query = "Mr Nobody";
    }

    request("https://www.omdbapi.com/?t=" + query + "&apikey=trilogy", function(error, response, body) {
        var movie = JSON.parse(body);

        // Title of the movie
        console.log("Title: " + movie.Title);

        // Year the movie came out
        console.log("Year: " + movie.Year);

        // IMDB rating of the movie
        console.log("IMDB Rating: " + movie.imdbRating);

        // Rotten Tomatoes Rating of the movie
        console.log("Rotten Tomatoes Rating: " + movie.Ratings[1].Value);
        
        // Country where the movie was produced
        console.log("Country: " + movie.Country);
   
        // Language of the movie.
        console.log("Language: " + movie.Language);
   
        // Plot of the movie.
        console.log("Plot: " + movie.Plot);
        
        // Actors in the movie.
        console.log("Actors: " + movie.Actors);

        console.log("---");
    });
} else {
    console.log("Error: not a recognized command");
}