## Adding a wiki to the pocket-io network

Adding a wiki to the network is pretty simple. 

1) Copy an existing 'server' edition directory into `./wikis' directory
2) Create a new wiki using the TiddlyWiki `--init` command

### 1) Copy an existing 'server' edition
If you already have a 'server' edition wiki - just copy that directory into the project `.\wikis' folder. Restart the system ('npm start') and the wiki will be included in the network.

### 2) Create a new wiki
From the project directory can use the standard tiddlywiki '--init' command to create a new ''server' edition wiki

`tiddlywiki ./wikis/NewWiki --init server`
> Note:
> 
> The wiki directory name should conform to the format allowed as a Javascript variable name - letters, numbers, underbar, dollarsign.  (ie: no spaces or dashes)
> 
>This is not actually a requirement, but the wiki directory name is used to reference the wiki in the pocket-io network as a Javascript object. 
> 
> So as a developer - save yourself `A LOT!!! of grief` and have the name of the 'server' edition wiki directory in the `./wikis' folder something like 'MyWikiOfAmazingTiddlers' instead of '$$ __this is the-bestest-wiki ever!__ $$'.
> 
> Plus when the system displays the name of the wiki in the network - would look, well... just weird.
> - LOL

## Default wiki in the pocket-io network

The `./config' file in the project directory has an option 'defaultWiki'. This is the wiki that will be displayed first in the client list of wikis. It also is the wiki that is the starting wiki of your application.

When installed - by default - the 'Home' wiki is at address `http://{domainName}:3000' (this assumes 3000 is the 'baseport' of the proxy servers is unchanged).

> If you are running a browser on the same machine the project is installed - then 'localhost' can be used as  '{domainName}'.

The default install has a wiki named 'Home' - go to 'http://localhost:3000' and should see -

`img here`

 