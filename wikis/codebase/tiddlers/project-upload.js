// Upload code to server
function projectUpload(socket, msg) {
 var senderTid = cpy(msg.senderTiddler);
 senderTid.ioResult = '';

 var project = senderTid.title;
 var tabName = senderTid.ioPrjTabSelected;

 if (tabName === 'AALLLL') {
  tabName = `[tag[$:/pocket-io/code/${project}]]`;
 }
 if (!/^\[/.test(tabName)) {
  tabName = `[[${tabName}]]`;
 }

 senderTid.ioResult = formatIoResult(getCode(tabName));
 msg.resultTiddlers.push(senderTid);
 return msg;
}

topics.projectUpload = projectUpload;
