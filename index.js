var mongoose = require('mongoose');
var finder = require('findit')(process.argv[2] || '.');
var path = require('path');
var fs = require('fs');
var S = require('string');

// Connect to Mongoose/MongoDB
mongoose.connect('mongodb://localhost/lyrics');

var Song = mongoose.model('Song', {
  artist: String,
  album: String,
  song: String,
  lyrics: String
});

// Iterate through all subfolders looking for docs.
finder.on('file', function (file, stat) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }

    var nextSong = new Song({});

    // Find "Artist", get following line
    var regex = /Artist: *([^\n\r]*)/
    var artist = data.match(regex);

    if (artist) {
      nextSong.artist = (artist[1] || 'No artist found.');
    }

    // Find Album
    var regex = /Album: *([^\n\r]*)/
    var album = data.match(regex);

    if (album) {
      nextSong.album = (album[1] || 'No album found.');
    }

    // Find Song
    var regex = /Song: *([^\n\r]*)/
    var song = data.match(regex);

    if (song) {
      nextSong.song = (song[1] || 'No song found.');
    }

    // Find Lyrics
    var regex = /Typed by: *([^\n\r]*)/
    nextSong.lyrics = S(data.slice(data.search(regex))).stripTags().s;

    // STORE in Mongoose
    nextSong.save(function(err) {
      if (err) {
        console.log('Song save failed because ' + err);
      }
    });
  });
});

console.log('Fin.');
