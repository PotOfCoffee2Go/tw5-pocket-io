# TW5-pocket-io

## Purpose
I needed to take a break from TW5-Node-RED to let the code rest and my mind recover. So picked up a project that I had sitting in the wings for quite while implementing a TiddlyWiki server based on the oldie but goldie [pocket.io](https://www.npmjs.com/package/pocket.io) which is a minimalistic version of [socket.io](https://socket.io/) that weights about 1K instead of 60K.

I have numerious machines; tablets, phones, windows, linux, raspberry pi's (missing a Mac). All of which have TiddlyWiki installed with wikis loaded with tiddlers copy/pasted from internet surfing.

Although TiddlyWiki has all sorts of methods to export/import between machines, I find most to be a multi-step process; and with my short attention span - forget what I was doing and what tiddlers to copy and where ;(

So a solution is to have a common wiki on a server that can be accessed by any machine and retrieve and store tiddlers by filter. Up to now have used [http-server](https://www.npmjs.com/package/http-server) to bring up a common data wiki on which to store shared tiddlers - drag-n-drop. This works fine if the common data wiki is single file - but does not work if the common wiki is node.js 'server' edition - which is the way to go.

TW5-pocket-io allows the (huge) common wiki to be server edition.

![tw5-pocket-io-usage|690x345](upload://ls4BK9VrsHLh3ZOZuB72OMz7lCG.png)

## Usage
By default the TW5-pocket-io server delivers an 'empty.html' single file wiki  'http://192.168.1.??:3000' to the client that has a few minor tweaks. Most important being the '$:/poc2go/macro/tw5-pocket-io/network.js' macro is installed.

A tiddler opens with:

![tw5-pocket-io-screen|690x173](upload://3d43oy1TZHBLmfMpGPTH2H57iB6.png)

Can enter a filter and either 'Get tiddlers' from the common $data wiki - or 'Store tiddlers' to send tiddlers to $data. When 'Get tiddlers' the filter is applied to the $data wiki, while the filter is applied to the current wiki when 'Store tiddlers' pressed.

All works fine - job done!

## Then an Epiphany!

> Javascript alert!

Although only have two brain cells to rub together - one covered in bong juice and the other recovering from a hangover - I had an epiphany! Since using a [Node.js REPL instance](https://nodejs.org/api/repl.html) to handle the transfer of tiddlers - and since that REPL boots up and has access to the complete $tw codebase - could pull code dynamically from a $code wiki and immediately apply it to the TW5-pocket-io server!

So added a $code wiki which allows extracting Javascript tiddlers and immediately applying into the 'pocket.io network server'.

![tw5-pocket-io|690x345](upload://46BFAR0fw5mdWVMqlNNruaqrtPy.png)

Code can be loaded to the REPL from a Single File Wiki  loaded by the server :

![tw5-pocket-io-repl|690x279](upload://gS1ZQNnV3HaPx358GszEY3pQBXj.png)

or better yet from the console command window that starts up the TW5-pocket-io server :

![tw5-pocket-io-console|690x489](upload://vdHEnPT9hsZCZGXsmaaalLD0YHH.png)

Can enter `$code('[[twBoot]]')` from here as well. twBoot is a function which boots a TiddlyWiki instance. By changing the twBoot tiddler in $code wiki - the current 'twBoot' function can replaced by the new one.

Notice that both a common 'codebase' and 'database' server edition wikis are started which can be accessed from the TW5-pocket-io server by browser 'http://localhost:8082' and 'http://localhost:8083' respectively.

Using  'http://localhost:8082'  and navigating to the 'twBoot' tiddler will see :

![tw5-pocket-io-twboot|690x264](upload://p8Zn94PEr52TS3niaE0zwq6HBRN.png)

Any changes to the tiddler can be applied to the TW5-pocket-io server immediately.

`$code('[[twBoot]]')`

---




