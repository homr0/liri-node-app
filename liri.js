// Global environment variables
require("dotenv").config();
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");
var fs = require("fs");
var keys = require("./keys.js");

var spotify = new Spotify(keys.spotify);

var cmd = process.argv[2];
var query = process.argv[3];

// If there are more than 4 arguments, assume they are part of the query.
if(process.argv.length > 4) {
    for(var i = 4; i < process.argv.length; i++) {
        query += " " + process.argv[i];
    }
}

const midL = "---";
const endL = "---------";

// Writes to log.txt and logs to the console the result.
function writeLog(data) {
    fs.appendFile("log.txt", data + "\n", function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
}

// Logs the command.
var command = "[" + moment().format("DD/MM/YYYY-HH:mm") + "]node liri.js " + cmd;

if(query !== undefined) {
    command += " " + query;
}

fs.appendFileSync("log.txt", command + "\n", function(err) {
    if(err) {
        return console.log(err);
    }
});

writeLog(endL);
    
execute(cmd, query);

// Executes LIRI commands.
function execute(cmd, query) {
    switch(cmd) {
        case "concert-this":
            findConcert(query);
            break;
        
        case "spotify-this-song":
            findSong(query);
            break;

        case "movie-this":
            findMovie(query);
            break;

        case "do-what-it-says":
            findRandom();
            break;
        
        default:
            writeLog("Error: not a recognized command");
    }
}

// Gets a concert for an artist or band using Bands In Town.
function findConcert(query) {
    axios.get("https://rest.bandsintown.com/artists/" + query + "/events?app_id=codingbootcamp").then(function(response) {
        var concerts = response.data;
        var concert = "";

        for(var i = 0; i < concerts.length; i++) {
            let venue = concerts[i].venue;

            // Name of the venue
            concert += "Venue: " + venue.name + "\n";

            // Venue Location
            concert += "Location: " + venue.city + ", " + venue.country + "\n";

            // Date of the Event
            concert += "Date: " + moment(concerts[i].datetime).format("MM/DD/YYYY") + "\n";

            if(i == concerts.length - 1) {
                concert += endL;
            } else {
                concert += midL + "\n";
            }
        }
        
        writeLog(concert);
    })
    .catch(function(error) {
        return writeLog("Error: " + error);
    });
}

// Finds a song from Spotify.
function findSong(query) {
    // If no song is put, then we will look for "The Sign" by Ace of Base.
    if(query == undefined) {
        query = "The Sign";
    }

    spotify.search({
        type: "track",
        query: query
    }).then(function(data) {
        let songs = data.tracks.items;
        var song = "";

        for(var i = 0; i < songs.length; i++) {
            // Artist(s)
            let artists = songs[i].artists;
            let arr = [];
            for(let j = 0; j < artists.length; j++) {
                arr.push(artists[j].name);
            }

            song += "Artist(s): " + arr.join(", ") + "\n";

            // Name of song
            song += "Name: " + songs[i].name + "\n";

            // A preview link of the song from Spotify
            song += "Preview URL: " + songs[i].preview_url + "\n";

            // The album that the song is from
            song += "Album: " + songs[i].album.name + "\n";

            if(i == songs.length - 1) {
                song += endL;
            } else {
                song += midL + "\n";
            }
        }

        writeLog(song);
    }).catch(function(err) {
        return writeLog("Error: " + err);
    });
}


// // Finds a movie using OMDb.
function findMovie(query) {
    // If no query is put, then it will use Mr. Nobody.
    if(query == undefined) {
        query = "Mr Nobody";
    }
    
    axios.get("https://www.omdbapi.com/?t=" + query + "&apikey=59c7faa2").then(function(response) {
        var movie = response.data;

        // Title of the movie
        var movieData = "Title: " + movie.Title + "\n";

        // Year the movie came out
        movieData += "Year: " + movie.Year + "\n";

        // IMDB rating of the movie
        movieData += "IMDB Rating: " + movie.imdbRating + "\n";

        // Rotten Tomatoes Rating of the movie
        movieData += "Rotten Tomatoes Rating: " + movie.Ratings[1].Value + "\n";
        
        // Country where the movie was produced
        movieData += "Country: " + movie.Country + "\n";
    
        // Language of the movie.
        movieData += "Language: " + movie.Language + "\n";
    
        // Plot of the movie.
        movieData += "Plot: " + movie.Plot + "\n";
        
        // Actors in the movie.
        movieData += "Actors: " + movie.Actors + "\n";

        writeLog(movieData + endL);
    }).catch(function(error) {
        return writeLog("Error: " + error);
    });
}

// Reads commands off of random.txt.
function findRandom() {
    fs.readFile("./random.txt", "utf-8", function(err, data) {
        if(err) {
            return writeLog("Error: " + err);
        }

        // Gets the array of commands and queries.
        var random = data.split("\r\n");

        for(var i = 0; i < random.length; i++) {
            var split = random[i].indexOf(",");
            var cmd = random[i].substring(0, split);
            var query = random[i].substring(split + 1);

            // Executes each command after stripping out the extra quotes.
            if(((query.indexOf("\"") >= 0) || (query.indexOf("'") >= 0)) && (query.charAt(0) == query.charAt(query.length - 1))) {
                query = query.slice(1, -1);
            }
            console.log(cmd, query);
            // execute(cmd, query);
            if(cmd == "concert-this") {
                findConcert(query);
            } else if(cmd == "spotify-this-song") {
                findSong(query);
            } else if(cmd == "movie-this") {
                findMovie(query);
            }
        }
    });
}