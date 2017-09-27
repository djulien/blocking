#!/usr/bin/env node
//synchronous (blocking) coding style test
'use strict';

require('colors');
const {onexit, blocking, wait, prompt} = require('../');
elapsed(); //start timer now

onexit(function() { console.log("quit now @%s sec".cyan_lt, elapsed()); });


blocking(function*()
{
    console.log("starting @%s sec".green_lt, elapsed());
    var response = yield prompt("Enter something and hit Enter ...".cyan_lt);
    console.log("got '%s' @%s sec".cyan_lt, response.replace(/\n/, "\\n"), elapsed());
    yield wait(-1); //no delay

    for (var i = 0; i < 10; ++i)
    {
        console.log("wait#%s @%s sec".blue_lt, i, elapsed());
        yield wait(1); //pause 1 sec
    }
    console.log("done @%s sec".green_lt, elapsed());
});


function elapsed()
{
    if (!elapsed.epoch) elapsed.epoch = Date.now();
    return (Date.now() - elapsed.epoch) / 1000; //msec => sec
}

//eof
