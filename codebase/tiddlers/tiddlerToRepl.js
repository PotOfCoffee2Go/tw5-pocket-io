function tiddlerToRepl(title) {
  // Use variables so doesn't match when loading this function
  var exp = new RegExp('^[\\S\\s]*rt.' + 'ignoreUndefined');
  var rpl = 'rt.' + 'ignoreUndefined';

  var type = 'text/plain';
  var parser = $tw.wiki.parseTiddler('$:/poc2go/rendered-plain-text');
  var widgetNode = $tw.wiki.makeWidget(parser,{variables: $tw.utils.extend({},{currentTiddler: title,storyTiddler: title})});
  var container = $tw.fakeDocument.createElement("div");
  widgetNode.render(container,null);
  var text = container.textContent;
  text = text.replace(exp, rpl);

  var prevPrompt = rt.getPrompt();
  rt.setPrompt('');
  text.split('\n').forEach(line => {
    if (line !== '') { rt.write(`${line}\n`); }
  })
  rt.setPrompt(prevPrompt);
  rt.displayPrompt();
}
