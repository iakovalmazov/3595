async function getVariants() {
  let response = await fetch('/variants')
  let content = await response.json()
  
  let text = ''
  let main = document.querySelector('#main')

  for(let key in content) {
    text += `
    <p>
    <label>
      <input name="variants" type="radio" value="${content[key].id}"/>
      <span>${content[key].title}</span>
    </label>
    </p>
    `
  }
  main.innerHTML = text 
}

vote.onclick = async function() {
  let variantsRadio = document.querySelector('input[name=variants]:checked')
  let variantsValue = variantsRadio ? variantsRadio.value : ''
  await fetch('/vote', {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({variants: variantsValue})
  })
  let response = await fetch('/stat')
  let content = await response.json()
  let text = ''
  let main = document.querySelector('#main')

  for(let key in content) {
    text += `
      <li><b>${content[key].title}</b> голосов: <b>${content[key].count}</b></li>
  `
  }
  main.innerHTML = text + `
    <h4>Cкачать результат в формате:</h4>
    <form method="POST" action="/stat">
      <input type="hidden" name="type" value="xml">
      <input type="submit" value="xml" onclick="saveVariant('application/xml')">
    </form>
  ` +
  `<form method="POST" action="/stat">
      <input type="hidden" name="type" value="html">
      <input type="submit" value="html" onclick="saveVariant('text/html')">
    </form>
  ` +
  `<form method="POST" action="/stat">
      <input type="hidden" name="type" value="json">
      <input type="submit" value="json" onclick="saveVariant('application/json')">
    </form>
  `
  document.getElementById('vote').style.display='none'
}

async function saveVariant(type) {
  await fetch('stat', {
    method: 'POST',
    headers: {'Accept': type},
    body: type
  })
}

getVariants()

 
