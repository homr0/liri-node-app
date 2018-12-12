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

var random = [];
var search = 0;
const midL = "---------";
const endL = "---------------------------";

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

function initLiri() {
    writeLog(endL);

    // Sets up the initial log data.
    var program = process.argv[1];
    if(program.lastIndexOf("/") >= 0) {
        program = program.substring(program.lastIndexOf("/") + 1);
    } else if(program.lastIndexOf("\\") >= 0) {
        program = program.substring(program.lastIndexOf("\\") + 1);
    }

    // Logs the command.
    var command = "[" + moment().format("DD/MM/YYYY-HH:mm") + "]node " + program + " " + cmd;

    if(query !== undefined) {
        command += " " + query;
    }

    fs.appendFileSync("log.txt", command + "\n", function(err) {
        if(err) {
            return console.log(err);
        }
    });

    // Gets the commands to run.
    if(cmd == "do-what-it-says") {
        fs.readFile("./random.txt", "utf-8", function(err, data) {
            if(err) {
                return writeLog("Error: " + err);
            }

            // Sets up the random array.
            data = data.split("\r\n");

            for(var i = 0; i < data.length; i++) {
                var split = data[i].indexOf(",");
                var cmd = data[i].substring(0, split);
                var query = data[i].substring(split + 1);

                // Strips out the extra quotes in the queries.
                if(((query.indexOf("\"") >= 0) || (query.indexOf("'") >= 0)) && (query.charAt(0) == query.charAt(query.length - 1))) {
                    query = query.slice(1, -1);
                }

                random.push([cmd, query]);
            }
            findStuff();
        });
    } else {
        random.push([cmd, query]);
        findStuff();
    }
}

function findStuff() {
    if(search < random.length) {
        execute(random[search][0], random[search][1]);
    }
}

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
        
        default:
            writeLog("Error: not a recognized command");
    }
}

// Gets a concert for an artist or band using Bands In Town.
function findConcert(query) {
    axios.get("https://rest.bandsintown.com/artists/" + query + "/events?app_id=codingbootcamp").then(function(response) {
        var concerts = response.data;
        var concert = query + " will be performing at:\n" + midL + "\n";

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

        search++;
        findStuff();
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
        var song = "Spotify results for \"" + query + "\"...\n";
        query = query.toLowerCase();

        for(var i = 0; i < songs.length; i++) {
            // Restricts output to just the query.
            if(songs[i].name.toLowerCase().indexOf(query) >= 0) {
                song += midL + "\n";

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
            }
        }

        song += endL;

        writeLog(song);

        search++;
        findStuff();
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

        search++;
        findStuff();
    }).catch(function(error) {
        return writeLog("Error: " + error);
    });
}

initLiri();