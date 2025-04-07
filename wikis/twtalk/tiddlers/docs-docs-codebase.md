## System functionality

The infrastructure to startup the system resides in the tw5-node-red `./lib` directory. It is not expected that JavaScript code in the `./lib` will be modified (with the exception of bug fixes) - as most of the core server code comes from JavaScript tiddlers contained in your wikis created/copied to the `wikis` directory.

The 'codebase' wiki (located in `./network/codebase`) is always loaded upon startup. It is the code that is required for the system to operate. 

Any wiki in the network is capable of uploading JavaScript code to the server to add application specific features. Can be done manually or automatically, minified or verbatim (helpful to track bugs during development). Other than a few edge-case exceptions, code changes are dynamic and take effect immediately upon upload.

The most common method of adding unique functionality to your application is to create a Node-Red flow, function node, or sub-flow. It is dynamic with the changes taking effect immediately upon deploying changes made in the Node-Red Flow Editor.

The system has three client-side and three server-side places to implement application specific functionality.

* Client-side 
    1) TW macro `./public/tw5-pocket-io-network.js.tid`.
        * Is automatically added/updated into every wiki in the network
        * Changes to this macro requires a re-start
            * (TiddlyWiki JavaScript macros require a restart)
        * Implements a websocket ([out-of-band](https://en.wikipedia.org/wiki/Out-of-band_management)) channel to the server
            * bi-directional - allows server to send commands to clients
                * for ex: have clients 'refresh' after it's wiki is updated
            * client access to other wikis in the network
            * client-to-client communications
            * client messages to/from Node-Red
        * Over the years - this guy is pretty much rock solid.
    2) Pocket-io (and optional supporting) plugins
        * Automatically added to every wiki in the network 
        * Provides individual client-side settings
            * (controlpanel -> settings) 
        * TW GUI templates for client dashboards
    3) Plugin Maker
       * Optionally, can automatically add any plugin to all wikis in network
           * (plugin must exist in 'codebase') - see below
       * [TW browser](https://tiddlywiki.com/dev/static/How%2520to%2520create%2520plugins%2520in%2520the%2520browser.html) based plugin maker
       * Create application specific plugins
&nbsp;
* Server-side
    1) JavaScript modules in `./lib` brings the system up
        * Rarely changed unless adding a new design element to the system
    2) 'codebase' wiki JavaScript tiddlers adds global, required, and commonly used code to the server
        * Can be 'hidden' and unaccessable by users
        * Any plugin in 'codebase' can be automatically loaded to all wikis in the network.
            * If plugin updated - updates all wikis in network
        * Independent of Node-Red - always loaded
        * Message handlers between clients, Node-Red, server topics, client-to-client
        * Add express routes to proxy servers 
    3) Node-Red flows and functions add application specific functionality
        * Most common place to add code to server
        * Dynamic - add flow then deploy - immediately implemented
        * Node-Red has complete access to all objects of system
            * config, settings, Webserver $tw instances, proxies, etc.

