module.exports = {
    convert_time: function (value) {
        if (/^lightning/.test(value)) {                 // using regex - because of there is a return carriage then the === match won't work
            return 5;                                   // lightning is a 5 minute talk
        }
        else {
            return Number(value.split('min')[0]);       // we want to extract the minutes from the file
        }
    },
    remove_times : function (old_times, used_times) {           // this function removes the used schedules from the input stream
        var new_times = old_times.filter(function (value) {     // filtering 
            var notUsed = true;                                 // the not already used times. 
            used_times.forEach(function (value2) {              // we look through the array to find out if we can remove it. 
                if (value2.talk === value.talk) {
                    notUsed = false;
                    return
                }
            });
            return notUsed;
        });
        return new_times;
    },
    twelve_hour_clock : function (val){     // this converts our 24 hour clock to a 12 hour clock
        var hours = Math.floor(val/60);     // we get the hours first
        var time_of_day = 'AM';             // default to AM 
        var minutes = val-hours*60;         // get the mintues
        if(hours>12){                       // if the hours are creater than 12, set PM and make hours a mod of 12   
            time_of_day="PM";               // setting to PM
            hours = hours%12;               // now we wrap the hours over the modulus. 
        }
        if(hours<10){                       // we need to pad the hours less than 12. 
            hours = "0"+hours.toString();   // casting as a string
        }
        if(minutes<10){                     // the minutes less than 10 too. 
            minutes="0"+minutes.toString(); // casting as a string
        }
        return hours+":"+minutes+"PM";      // we create the time stamp. 
    },
    find_time_slot :function (array_of_times, compiled_slot, times_to_fit_start, times_to_fit_end) {

        if (times_to_fit_start <= 0 && times_to_fit_end > 0 ) {     // this is the fuzzy logic condition where we want the schedules to fit between two end times
            var squeeze_in_one_more = false;                        // we are going to see if we can squeeze one more talk into a track
            array_of_times.forEach(function(value){                 // so we check through the remaining elements in the array. 
                if(times_to_fit_end-value.time>0){                  // and if we find a talk that can fit into this track
                    squeeze_in_one_more = true;                     // then we can squeeze it in.
                }
            });
            if(!squeeze_in_one_more){                   // if we cannot squeeze anything more in - lets just return that the array is done
                return true;
            }
        }
        else if (times_to_fit_start === 0) {            // we have fit the bottom 
            return true;
        }
        else if (array_of_times.length === 0) {         // if the array is finished, we have not found a match going through path.       
            return false;
        }
        var i = 0;      
        while (i < array_of_times.length) {             // we will look through each element in the array - but if we find what we are looking for, we will return
            if (array_of_times[i].time <= times_to_fit_end) {               // if this schedule fits,
                var new_array = array_of_times.filter( (value, index) => { return index != i });   // then we can look for the next schedule/
                var start = times_to_fit_start - array_of_times[i].time;    // we work out the new "must be after" time
                var end = times_to_fit_end - array_of_times[i].time         // and the new "must be before" time
                if (this.find_time_slot(new_array, compiled_slot, start, end)) { // we recursively call this function - if we get a true, then we know we found a good path right to the last element
                    compiled_slot.push(array_of_times[i]);          // we push this onto the array
                    return true;                                    // since this is a good path, we pass true all the way up.
                }
            }
            i++;        // we just incremend the index. 
        }
        return false;   // if we found nothing - then this was a bad path. 
    },
    build_track :function (times, start_time, finish_after, finish_before) {    // function that builds a track for us.
        var track = [];
        this.find_time_slot(times, track, (finish_after - start_time) * 60, (finish_before - start_time) * 60);  // we want to find the time slots. 
        times = this.remove_times(times, track);                                // remove the found times
        return track;                                                           // we return the track that was minted. 
    },
    create_track: function (times, start_time, lunch_time, min_end_time, max_end_time){             // function to create a track.                                       
        var track =[];                
        track = track.concat(this.build_track(times, start_time, lunch_time, lunch_time));          // we create the morning session first - 
        track = track.concat(new Array({"time":60,"talk":"Lunch"}));                                // and now we add the lunch session
        track = track.concat(this.build_track(times, lunch_time+1, min_end_time, max_end_time));    // finally, we add the lunch hour and work on the afternoon session. 
        return track;
    }
}