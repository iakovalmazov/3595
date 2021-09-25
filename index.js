const express = require('express')
const fs = require('fs')
const path = require('path')
const {toXML} = require("jstoxml")
const json2html = require('node-json2html')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Голосование</title>
  </head>
  <body>
    <h1>Лучшая в мире команда?</h1>
    <div id="main"></div>
    <button id="vote">Голосовать</button>
    <script src="app.js"></script>
  </body>
  </html>
  `)
})

app.get('/variants', async (req, res) => {
  const variants = await getData('variants.json')
  res.send(variants)
})

app.get('/stat', async (req, res) => {
  const stat  = await getData('stat.json')
  res.send(stat)
})

app.post('/vote', async (req, res) => {
  await addData(req.body.variants)
  const stat  = await getData('stat.json')
  res.send(stat)
})

app.post('/getStat', async (req, res) => {
  const stat  = await getData('stat.json')
  res.setHeader('Content-Disposition', 'attachment; filename = stat.' + req.body.type)
  if(req.body.type === 'xml') {
    res.setHeader('Content-Type', 'application/xml')
    res.send(toXML(stat))
  } else if(req.body.type === 'html') {
    res.setHeader('Content-Type', 'text/html')
    res.send(json2html.transform(stat, {"<>":"li","html":"${title} голосов ${count}"}))
  } else {
    res.setHeader('Content-Type', 'application/json')
    res.send(stat)
  }
})

async function getData(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, 'data', fileName),
      'utf-8',
      (err, content) => {
        if(err) {
          reject(err)
        } else {
          resolve(JSON.parse(content))
        }
      }
    )
  })
}

async function addData(id) {
  const stat = await getData('stat.json')
  const variant = stat.find(c => c.id == id)
  if(variant) {
    variant.count ++
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(__dirname, 'data', 'stat.json'),
      JSON.stringify(stat),
      (err) => {
        if(err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}



const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
})

