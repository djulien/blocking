//functions to allow JavaScript synchronous coding style
//Copyright (c) 2016-2017 Don Julien

'use strict'; //find bugs easier
//require('colors'); //for console output
const keypress = require('keypress');
//const {caller} = require("./caller");
//const {debug} = require('./debug');
const util = require("util");

//register callbacks when synchronous main ends:
const onexit =
module.exports.onexit =
function onexit(new_cb)
{
    if (!onexit._cbs) onexit._cbs = [];
    if (new_cb) onexit._cbs.push(new_cb); //register this callback
    else //call registered functions
//    {
//        debug("call %d exit cbs".cyan_lt, onexit._cbs.length, caller());
        onexit._cbs.forEach(cb => { cb(); }); //setImmediate(cb); }); //call after return to caller
//    }
}


//step thru generator function until done:
//allows synchronous (blocking) coding style
//returns to caller immediately
const blocking =
module.exports.blocking =
function blocking(gen)
{
//    process.stdin.pause(); //don't block process exit while not waiting for input
//    var retval;
	for (;;)
	{
        var done = step(gen);
        if (typeof done == "undefined") return;
		if (!done) continue;
        onexit();
        return step.retval;
	}
}


//step thru generator function once:
//allows synchronous (blocking) coding style
const step =
module.exports.step =
function step(gen)
{
	if (typeof gen == "function") //invoke generator if not already
    {
//console.log("blocking: func -> gen");
        setImmediate(function() { step(gen()); }); //avoid hoist errors
        return;
    }
//    process.stdin.pause(); //don't block process exit while not waiting for input
//    var retval;
//console.log("prev retval", typeof blocking.retval, util.inspect(blocking.retval));
	var status = gen.next(step.retval); //send previous value to generator
//		if (!status.done && (typeof status.value == "undefined")) continue; //cooperative multi-tasking
	if (typeof status.value == "function") //caller wants manual step
    {
        step.retval = status.value(gen); //remember latest ret val
        return; //caller wants to execute before next step
    }
    step.retval = status.value; //remember latest ret val, pass to next step
    return status.done;
}


//wake up from synchronous sleep:
const wait =
module.exports.wait =
function wait(delay)
{
//console.log("%swait(%d sec)", (delay <= 0)? "no-": "", delay);
    delay *= 1000; //sec -> msec
    return (delay > 0)? setTimeout.bind(null, blocking, delay): setImmediate.bind(null, blocking);
}


//allow caller to pause and restart later:
const pause =
module.exports.pause =
function pause(THIS)
{
    return function(gen) { /*debug("save gen", gen)*/; THIS.svgen = gen; } //save generator for text wakeup later
}


//pause for synchronous keyboard input (string):
//useful info:
// https://github.com/TooTallNate/keypress
// https://docs.nodejitsu.com/articles/command-line/how-to-prompt-for-command-line-input/
const prompt =
module.exports.prompt =
function prompt(args)
{
    if (!prompt.init)
    {
        process.stdin.setEncoding('utf8');
//        process.stdin.setRawMode(true); //get each char
        process.stdin.on('data', function(text)
        {
            process.stdin.pause();
//        process.exit();
//        process.stdin.pause();
            blocking.retval = text.toString(); //give entered text back to caller
            blocking(prompt.svgen);
        });
        prompt.init = true;
    }
    process.stdin.resume();
    console.log.apply(console, args? arguments: ["Enter to continue ..."]);
    return pause(prompt); //function(gen) { prompt.gen = gen; } //save generator for text wakeup later
}


//pause for synchronous keyboard input (single char):
const getchar =
module.exports.getchar =
function getchar(args)
{
    if (!getchar.init)
    {
        keypress(process.stdin); //ask for keypress events
        process.stdin.setRawMode(true);
        process.stdin.on('keypress', function(ch, key)
        {
//console.log("getchar gen", getchar.gen);
            process.stdin.pause();
//        console.log('got "keypress"', key);
//        if (key && key.ctrl && key.name == 'c') process.stdin.pause();
            blocking.retval = (key || {}).name;
            blocking(getchar.svgen);
        });
        getchar.init = true;
    }
    process.stdin.resume();
    if (console.log._previous) console.log._previous = null; //kludge: defeat custom console dedup
    console.log.apply(console, args? arguments: ["Any key to continue ..."]);
    return pause(getchar); //function(gen) { /*debug("save gen", gen)*/; getchar.gen = gen; } //save generator for text wakeup later
}

//eof
