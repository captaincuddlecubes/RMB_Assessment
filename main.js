var fs = require('fs');                     // so we can read in the input
var functions = require('./functions');     // importing some of our functions
var start_time = 9, lunch_time = 12,  min_end_time = 16, max_end_time = 17;     // these are the times that we want to use (in hours)       
var times = fs.readFileSync("input.txt")    // we read in the file
              .toString()                   // convert to a string
              .split('\n')                  // split in new lines
              .filter(function (value) {    // filter out the lines that are mostly empty
                if (value.length > 1){      // if it's emptry string - get rid of it. 
                    return true;            // we only strings that have a length
                }
                return false;
              })
              .map(function (value) {       // we want to create JSON objects that are easy to manipulate
                var talk = {
                    time: functions.convert_time(value.split(' ')[value.split(' ').length - 1]),  // getting the last elemnt from the array (this is the time)
                    talk: value.replace('\r', '')       // and now this is the whole string from the line -> we want to remove the return carraige
                }
                return talk;                // return talk.
              });
console.log("\nTrack 1: \n");               // we post this to the screen.
var running_time = start_time*60;           // we start the running time
var track_1 = functions.create_track(times, start_time, lunch_time, min_end_time, max_end_time);        // creating track 1
track_1.forEach(function(value){            // now we run through the JSON object we created - and add up all the values.
    console.log(functions.twelve_hour_clock(running_time)+" "+value.talk);
    running_time+=value.time;               // increasing the timmer 
});
console.log(functions.twelve_hour_clock(17*60)+" "+"Networking\n\n"); // we print the Networking session -> 17 hundred hours * 60 to get minutes


console.log("Track 2: \n");                 // now we need to do the Track 2 session.
running_time = start_time*60;               // reseting the running time
var track_2 = functions.create_track(times, start_time, lunch_time, min_end_time, max_end_time);        // creating track 2 schedule from what is left in the times array.
track_2.forEach(function(value){            // for each value in track_2
    console.log(functions.twelve_hour_clock(running_time)+" "+value.talk);
    running_time+=value.time;
});
console.log(functions.twelve_hour_clock(17*60)+" "+"Networking");   // we print the Networking session -> 17 hundred hours * 60 to get minutes