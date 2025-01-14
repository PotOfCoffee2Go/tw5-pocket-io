title: $:/poc2go/macro/testCurTiddler.js
tags: test
type: application/javascript
module-type: macro

// Test currentTiddler macro
$tw.wiki.addTiddler(new $tw.Tiddler({
	title: '$:/temp/poc2go/macros',
	tags: '$:/tags/Macro',
	text: `\\define curtiddlertest() <$macrocall $name=curtiddlertest sender="$(currentTiddler)$" />

curtiddlertest macro
`

(function(){

exports.name = 'curtiddlertest';

exports.params = [
	{name: 'sender'},
];

exports.run = (sender) => {
	console.log(sender);
}

})();
