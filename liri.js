// Global environment variables
require("dotenv").config();
var Spotify = require("node-spotify-api");
var request = require("request");
var moment = require("moment");
var fs = require("fs");
var keys = require("./keys.js");

var spotify = new Spotify(keys.spotify);
var log = fs.createWriteStream("log.txt", { flags: "a" });

var cmd = process.argv[2];
var query = process.argv[3];

const midL = "---";
const endL = "---------";

// Writes to log.txt and logs to the console the result.
function writeLog(data) {
    log.write(data + "\n");
    console.log(data);
}

// Executes LIRI commands.
function execute(cmd, query) {
    if(cmd == "concert-this") {
        // Gets a concert for an artist or band using Bands In Town
        request("https://rest.bandsintown.com/artists/" + query + "/events?app_id=codingbootcamp", function(error, response, body) {
            if(!error && (response.statusCode === 200) && (body.indexOf("error=") < 0)) {
                var concerts = JSON.parse(body);
    
                for(var i = 0; i < concerts.length; i++) {
                    let venue = concerts[i].venue;
        
                    // Name of the venue
                    writeLog("Venue: " + venue.name);
        
                    // Venue Location
                    writeLog("Location: " + venue.city + ", " + venue.country);
        
                    // Date of the Event
                    writeLog("Date: " + moment(concerts[i].datetime).format("MM/DD/YYYY"));
                    
                    if(i == concerts.length - 1) {
                        writeLog(endL);
                    } else {
                        writeLog(midL);
                    }
                }
            } else {
                return writeLog("Error: " + error);
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
                writeLog("Artist(s): " + arr.join(", "));
    
                // Name of song
                writeLog("Name: " + songs[i].name);
    
                // A preview link of the song from Spotify
                writeLog("Preview URL: " + songs[i].preview_url);
    
                // The album that the song is from
                writeLog("Album: " + songs[i].album.name);
    
                if(i == songs.length - 1) {
                    writeLog(endL);
                } else {
                    writeLog(midL);
                }
            }
        }).catch(function(err) {
            return writeLog("Error: " + err);
        });
    } else if(cmd == "movie-this") {
        // Finds a movie using OMDb
        // If no query is put, then it will use Mr. Nobody.
        if(query == undefined) {
            query = "Mr Nobody";
        }
    
        request("https://www.omdbapi.com/?t=" + query + "&apikey=trilogy", function(error, response, body) {
            if(error) {
                return writeLog("Error: " + error);
            }
    
            var movie = JSON.parse(body);
    
            // Title of the movie
            writeLog("Title: " + movie.Title);
    
            // Year the movie came out
            writeLog("Year: " + movie.Year);
    
            // IMDB rating of the movie
            writeLog("IMDB Rating: " + movie.imdbRating);
    
            // Rotten Tomatoes Rating of the movie
            writeLog("Rotten Tomatoes Rating: " + movie.Ratings[1].Value);
            
            // Country where the movie was produced
            writeLog("Country: " + movie.Country);
       
            // Language of the movie.
            writeLog("Language: " + movie.Language);
       
            // Plot of the movie.
            writeLog("Plot: " + movie.Plot);
            
            // Actors in the movie.
            writeLog("Actors: " + movie.Actors);
    
            writeLog(endL);
        });
    } else if(cmd == "do-what-it-says") {
        fs.readFile("./random.txt", "utf-8", function(err, contents) {
            if(err) {
                return writeLog("Error: " + err);
            }
    
            var random = contents.split("\r\n");
            for(var i = 0; i < random.length; i++) {
                let split = random[i].indexOf(",");
                let cmd = random[i].substring(0, split);
                let query = random[i].substring(split + 1);

                // Removes the quotes so that concert-this works
                execute(cmd, query.slice(1, -1));
            }
    
        });
    
    } else {
        writeLog("Error: not a recognized command");
    }
}

// Logs the command.
var command = "[" + moment().format("DD/MM/YYYY-HH:mm") + "]node liri.js " + cmd;

if(query !== undefined) {
    command += " " + query;
}

log.write(command + "\n");

writeLog(endL);

execute(cmd, query);