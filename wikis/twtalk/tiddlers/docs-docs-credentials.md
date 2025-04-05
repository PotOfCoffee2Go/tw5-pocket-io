## Credentials

The system uses the credential settings of Node-Red for both the flow editor and node level credentials. For the TW Webservers TiddlyWiki settings are used.

Node-Red Flow Editor credentials is documented at [Editor & Admin API security](https://nodered.org/docs/user-guide/runtime/securing-node-red#editor--admin-api-security) while individual node credentials is at [Node credentials](https://nodered.org/docs/creating-nodes/credentials).

Node-Red has both Basic and OAuth built-in. Whatever credentials you have set up in your Node-Red settings.js file will be used.

For TiddlyWiki, the system uses the [WebServer Basic Authentication](https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html) for each 'server' edition wiki in the 'wikis' directory. This is somewhat problematic as each wiki has it's own CSV file [WebServer Parameter: credentials](https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html) of usernames/passwords.

> If you have 10 wikis then would have 10 Webservers, each having it's own CSV file. To maintain the CSV files when adding/changing user permissions for the wikis is burdensome. Webservers sharing the same CSV file is not feasible as more than likely users will have differing access permissions depending on the wiki.

TW5-Node-Red `config.js` file has a credentials section which will generate the credentials, [WebServer Authorization](https://tiddlywiki.com/static/WebServer%2520Authorization.html) parameters, and CSV files for each wiki based on the settings.

By default a User/Password file and CSV files are stored in your user  directory `.tw5-node-red` (note the 'dot') sub-directory. This keeps the credential information separate and remain unchanged between release updates.

To recreate the credentials, delete them from the `.tw5-node-red` directory. Credential parameters and files are automatically recreated if not present on system startup.
