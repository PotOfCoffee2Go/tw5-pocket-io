// Copy tiddlers from web client to $data database wiki 
function setData(socket, msg) {
 var senderTid = cpy(msg.senderTiddler);
 senderTid.ioResult = '';

 msg.filterTiddlers.forEach(tiddler => {
  $dw.wiki.addTiddler(new $dw.Tiddler(
   $dw.wiki.getCreationFields(),
   tiddler,
   $dw.wiki.getModificationFields(),
  ))
 })

 senderTid.ioResult = formatIoResult(`{{!!modified}}

${msg.filterTiddlers.length} tiddlers updated on $data wiki`);
 msg.resultTiddlers.push(senderTid);
 return msg;
}

topics.setData = setData;
