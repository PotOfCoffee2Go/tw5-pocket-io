## Projects
There are two differing 'project' systems - there is an optional 'Project Management' system that can be used with-in a networked wiki to help in building that wiki's dashboard, documentation, TW GUI templates, and the wiki's JavaScript code to be uploaded and run on the server.

There is also a lower level NPM 'Project' directory which contains the credentials, webserver wikis, wiki databases, Node-Red flows and configuration settings that are unique to your application. Thus your application is kept separate from the TW5-Node-Red project itself, making your project more 'tolerant' of tw5-node-red release updates.

The default Project directory is in the user's `.tw5-node-red` folder. If it does not exist, will be created on startup with the wikis and stuff of a fresh TW5-Node-Red install. Generally, would make changes in `.tw5-node-red` to customize settings and wikis of your application.

The folder contains the normal NPM project structure; a basic package.json, README.md, .gitignore, credentials, and directories containing your client 'wikis', 'dbs' wiki databases, and Node-Red 'flows' for your tw5-node-red project. You can have multiple Project directories which can be easily setup to upstream to GitHub -  [Add existing project to GitHub](https://gist.github.com/alexpchin/102854243cd066f8b88e).

The `.tw5-node-red` Project is used by default on startup. A different Project directory can be specified using the command line ('-p') option.
