/*\
title: $:/poc2go/modules/commands/saveapps.js
type: application/javascript
module-type: command

Saves application tiddlers in plain text

\*/
(function(){

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

    var removeCommentBlocks = require("$:/poc2go/modules/utils.js").removeCommentBlocks;

    exports.info = {
        name: "saveapps",
        synchronous: true
    };

    const subCommander = {
      checkForErrors: (err) => {
        if (err) {
          $tw.utils.error("Error: " + err);
        }
      },
      execute: (wiki, cmds) => {
        new $tw.Commander(cmds, subCommander.checkForErrors, wiki,
          {output: process.stdout, error: process.stderr})
        .execute();
      }
    }

    function tiddlerToText(title) {
      // Use variables so doesn't match when loading this function
      var exp = new RegExp('^[\\S\\s]*rt.' + 'ignoreUndefined');
      var rpl = 'rt.' + 'ignoreUndefined';

      var type = 'text/plain';
      var parser = $tw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');
      var widgetNode = $tw.wiki.makeWidget(parser,{
        variables: $tw.utils.extend({},{currentTiddler: title, storyTiddler: title})
      });
      var container = $tw.fakeDocument.createElement("div");
      widgetNode.render(container,null);
      var text = container.textContent;
      return text.replace(exp, rpl);
    }

    var Command = function(params,commander,callback) {
        this.params = params;
        this.commander = commander;
        this.callback = callback;
    };

    Command.prototype.execute = function() {
      var self = this,
          fs = require("fs"),
          path = require("path"),
          filepath = path.resolve(self.commander.outputPath),
          result = null,
          wiki = this.commander.wiki,
          tiddlerFilter = this.params[0],
          filenameFilter = this.params[1] || "[is[tiddler]]",
          tiddlers = wiki.filterTiddlers(tiddlerFilter || '[tag[app]]');

      subCommander.execute(wiki, [
        '--output', '.',
        '--render',
        `[[runapp.js]]`,
        `[addprefix[./]]`,
        'text/plain',
        '$:/poc2go/rendered-plain-text',
      ])

      $tw.utils.createDirectory(`${filepath}`);

      $tw.utils.each(tiddlers, function(title) {
        if (!result) {
          var tiddler = self.commander.wiki.getTiddler(title);
          if (tiddler) {
            if(self.commander.verbose) {
                console.log("Saving app \"" + title + "\" to \"" + `${filepath}/${title}.out` + "\"");
            }
            var text = tiddlerToText(title);
            try {
              fs.writeFileSync(`${filepath}/${title}.js`, removeCommentBlocks(text));
              console.log(`node ./runapp "./${$tw.boot.wikiPath}/output/${title}.js"`);
            } catch (err) {
              result = `Unable to write tiddler '${filepath}/${title}.js'`;
              return result;
            }
          } else {
              result = "Tiddler '" + title + "' not found";
          }
        }
      });
      return result;
    };
    exports.Command = Command;
})();
