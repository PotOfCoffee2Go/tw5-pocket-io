## Credentials

The system uses the credential settings of Node-Red for the flow editor and node level credentials. For the TW Webservers TiddlyWiki settings are used.

Node-Red Flow Editor credentials is documented at [Editor & Admin API security](https://nodered.org/docs/user-guide/runtime/securing-node-red#editor--admin-api-security) while individual node credentails is at [Node credentials](https://nodered.org/docs/creating-nodes/credentials).

Node-Red has both Basic and OAuth built-in. Whatever credentials you have set up for in your Node-Red settings.js file will be used.

For TiddlyWiki, the system uses the [WebServer Basic Authentication](https://tiddlywiki.com/static/WebServer%2520Basic%2520Authentication.html) for each 'server' edition wiki in the './wikis' directory. This is somewhat problematic as each wiki has it's own CSV file [WebServer Parameter: credentials](https://tiddlywiki.com/static/WebServer%2520Parameter%253A%2520credentials.html) of usernames/passwords.

> If you have 10 Webservers then would have 10 CSV files to maintain when adding/changing user permissions. Having the Webservers sharing the same CSV file is not feasible as more than likely users will have differing access permissions depending on the wiki.

The `./config.js` file has a credentials section which will generate the credentials, [WebServer Authorization](https://tiddlywiki.com/static/WebServer%2520Authorization.html) parameters, and CSV file for each wiki based on the settings.

By default a User/Password file and CSV files are stored in your user directory `.tw5-node-red` (note the 'dot') sub-directory. This keeps the credential information separate from the project as well as remain unchanged between release updates and safe from accidental committing to GitHub.

To recreate the credentials, delete them from `.tw5-node-red` directory. Credential parameters/files are automatically created if not present on system startup.
