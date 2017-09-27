# blocking-style
Allows synchronous coding style in JavaScript

# Installation
`npm install blocking-style --save`

# Example usage
```javascript
require('blocking-style');
...
const {onexit, blocking, wait, prompt} = require('blocking-style');

onexit(function()
{
    console.log("this function called when main finishes");
});


//main function:
blocking(function*()
{
    console.log("start");

    var response = yield prompt("Waits here until something entered ...");
    console.log("you entered '%s'", response.replace(/\n/, "\\n"));
    yield wait(-1); //no delay

    for (var i = 0; i < 10; ++i)
    {
        console.log("wait");
        yield wait(1); //pause 1 sec
    }
    console.log("done");
});
```

Main function will wait synchronously for events such as keyboard entry or timer.  

Internally the code is still asynchronous, but a generator function can be used to allow the code to be structured with a synchronous, blocking code style like in other languages.
This can make the code easier to read, rather than using a bunch of callback functions.

See test/test.js for an example.

# License
MIT
