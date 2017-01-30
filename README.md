# Microsoft Bot Framework WebChat

Embeddable web chat control for the [Microsoft Bot Framework](http://www.botframework.com) using the [DirectLine](https://docs.botframework.com/en-us/restapi/directline3/) API.

Used by the Bot Framework developer portal, [Emulator](https://github.com/Microsoft/BotFramework-Emulator), WebChat channel, and [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/)

You can easily play with a recent build using [botchattest](https://botchattest.herokuapp.com)

## FAQ

### *How is it made?*

WebChat is a [React](https://facebook.github.io/react/) component built in [TypeScript](http://www.typescriptlang.org) using [Redux](http://redux.js.org) for state management and [RxJS](http://reactivex.io/rxjs/) for wrangling async.

### *How can I use it?*

* As an IFRAME in any website using the standard Bot Framework WebChat channel. In this case you don't need this repo or any of the information in it.
* As a standalone website, primarily for testing purposes
* As an IFRAME in any website, pointed at an instance hosted by you, customized to your needs
* Inline in your non-React webapp, customized to your needs    
* Inline in your React webapp, customized to your needs

See more detailed instructions [below](#getting-webchat-up-and-running).

### *How do I customize it?*

* Follow the [below instructions](#1-install-and-build) to install and build
* Customize the visuals by altering the [static/botchat.css](https://github.com/Microsoft/BotFramework-WebChat/blob/master/static/botchat.css) file
* Or go farther and change the HTML/JSX and/or TypeScript 

### *How do I contribute to it?*

* File [issues](https://github.com/Microsoft/BotFramework-WebChat/issues) and submit [pull requests](https://github.com/Microsoft/BotFramework-WebChat/pulls)!

### *Do you have a roadmap?*

Not the most formal one you'll ever see, but:

* Unit tests
* DirectLine 3.0 WebSocket support for retrieving messages 
* Improved styling
* Simple UI customization
* npm package(s)
* CDN

Feel free to suggest features by filing an [issue](https://github.com/Microsoft/BotFramework-WebChat/issues) (please make sure one doesn't already exist).

### How can I help?

* Add localized strings (see [below](#to-add-localized-strings))
* Report any unreported [issues](https://github.com/Microsoft/BotFramework-WebChat/issues)
* Propose new [features](https://github.com/Microsoft/BotFramework-WebChat/issues)
* Fix an outstanding [issue](https://github.com/Microsoft/BotFramework-WebChat/issues) and submit a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls) *(please only commit source code, non-generated files)*

## Getting WebChat up and running

### 1. Install and build

1. Clone this repo
2. `npm install`
3. `npm run build` (to build on every change `npm run watch`, to build minified `npm run minify`)

### 2. Obtain security credentials for your bot

1. If you haven't already, [register your bot](https://dev.botframework.com/bots/new).
2. Add a DirectLine channel, and generate a Direct Line Secret. Make sure to enable Direct Line 3.0.
3. For testing you can use your Direct Line Secret as a security token, but for production you will likely want to exchange that Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3/).

### 3. Decide how to run WebChat

#### Using the WebChat channel 

1. Head over to the [Bot Framework developer portal](https://dev.botframework.com/bots) and add the WebChat channel to your bot. You don't need this repo or any of the information on this page.

#### As a standalone web page, for quick and easy testing

This is a quick and dirty method, perfect for testing. It requires embedding your Direct Line Secret in the web page or querystring, and as such should primarily be used for local testing.

0. Build
1. Start a local web server using `npm run start` and aim your browser at `http://localhost:8000/samples?s={Direct Line Secret}`

#### Embedded via IFRAME

In this scenario you will host two web pages, one for WebChat and one for the page which embeds it. They could be hosted by the same web server, or two entirely different web servers. 

1. Serve the botchat in its own standalone web page, as described [above](#as-a-standalone-web-page-for-quick-and-easy-testing)
2. Optionally, on your web server, exchange the Direct Line Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3/).
3. In a second web page, embed the botchat via `<iframe src="http://{host}:{port}/samples?[s={Direct Line Secret}|t={Direct Line Token}]" width="320" height="500"/>`
4. You will probably want to customize the supplied sample index.html page

(An example of this approach is [botchattest](https://github.com/billba/botchattest))

#### Inline in your non-React website

In this scenario you will include a JavaScript file which embeds its own copy of React, which will run in a DOM element.  

0. Build
1. Include `webpacked/botchat.js` and you will get an object called `BotChat`
2. For TypeScript users there is a type definition file called [static/botchat.d.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/static/botchat.d.ts).
3. Incorporate [static/botchat.css](https://github.com/Microsoft/BotFramework-WebChat/blob/master/static/botchat.css) into your website deployment 
4. Optionally, on your web server, exchange the Direct Line Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3/).
5. Create an instance of `BotChat.DirectLine` using your Direct Line Secret or Token
6. Call `BotChat.App` with the DOM element where you want your chat instance, your DirectLine instance, user and bot identities, and other properties as demonstrated in [samples/index.html](https://github.com/Microsoft/BotFramework-WebChat/blob/master/samples/index.html). 

#### Inline in your React website

In this scenario you will incorporate WebChat's multiple JavaScript files into your React webapp. 

0. Build
1. Incorporate the files in the [/built](https://github.com/Microsoft/BotFramework-WebChat/blob/master/built) folder into your build process
2. Incorporate [static/botchat.css](https://github.com/Microsoft/BotFramework-WebChat/blob/master/static/botchat.css) into your website deployment
3. For TypeScript users there is a definition file called [static/botchat.d.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/static/botchat.d.ts).
4. Optionally, on your web server, exchange the Direct Line Secret for a Token as detailed in the Direct Line [documentation](https://docs.botframework.com/en-us/restapi/directline3/).
5. Create an instance of `DirectLine` using your Direct Line Secret or Token
6. Call the `Chat` React component with your DirectLine instance, user and bot identities, and other properties as demonstrated in [samples/index.html](https://github.com/Microsoft/BotFramework-WebChat/blob/master/samples/index.html). 

#### Using the Backchannel
NOTE: The provided backchannel sample requires a bot which can send and receive specific event messages. Follow the instructions [here](https://github.com/ryanvolum/backChannelBot) to deploy such a bot. 

Backchannel is a way to send activities of type "event" (which are ignored by the actual webchat) between the page that hosts webchat and your bot web service. The backchannel sample provided in this project listens for events of name "changeBackground" and sends events of activity name "buttonClicked". This highlights the ability for a bot to communicate with a page that embeds the bot through WebChat. In other words, our bot can:

* Send events to a page that hosts an instance of WebChat - demonstrated by the bot sending an activity of type "event" and of name "changeBackground", which changes the background color of the parent page. 
* Listen for events from the page that hosts an instance of WebChat - demonstrated by the bot responding "I see you clicked that button" when it receives an event named buttonClicked.

## Misc. notes

### To see WebChat logging

* When IFRAMEd, set `window.frames["{iframe_id}"].botchatDebug = true` from the browser console
* Otherwise set `window.botchatDebug = true` or `var botchatDebug = true` from the browser console       

### To add localized strings

In [src/Strings.ts](https://github.com/Microsoft/BotFramework-WebChat/blob/master/src/Strings.ts) :
* Add one or more locales (with associated localized strings) to `localizedStrings`
* Add logic to map the requested locale to the support locale in `strings`
* If you just adding a new locale for an existing set of strings, just update `strings` to return the existing locale's strings  
* ... and please help the community by submitting a [pull request](https://github.com/Microsoft/BotFramework-WebChat/pulls)! 

## Copyright & License

© 2016 Microsoft Corporation

[MIT License](/LICENSE)
