// Remove $:/StoryList tiddler(s)
//  (issues occur if multiple tw instances w/sync server)
function deleteStoryLists() {
  // Hack to remove $:/StoryList tiddler(s)
  //  prevent issues when a sync server is running 
  try {
    fs.readdirSync(`${twOutput}/tiddlers`)
      .filter(f => /\$__StoryList.*$/.test(f))
      .map(f => fs.unlinkSync(`${twOutput}/tiddlers/${f}`));
  } catch(e) {}
}
