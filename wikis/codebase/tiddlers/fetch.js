// x = await fetchText('https://gist.github.com/PotOfCoffee2Go/160f247423751b317b704a1063d8aed6/raw/Hello%2520World.tid');
function fetchText(getUrl) {
  return new Promise((resolve) => {
    fetch(getUrl)
      .then(res => res.text())
      .then(data => { resolve(data) })
      .catch(err => {console.error(err);});
  })
}

// x = await fetchJson('https://jsonplaceholder.typicode.com/users');
function fetchJson(getUrl) {
  return new Promise((resolve) => {
    fetch(getUrl)
      .then(res => res.json())
      .then(data => { resolve(data) })
      .catch(err => {console.error(err);});
  })
}
