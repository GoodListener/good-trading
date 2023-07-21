const express = require('express');
const fs = require('fs');
const app = express()
const port = 3000

app.set('views', __dirname + '/views');
app.set('view engine','ejs'); // 1
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  const files = fs.readdirSync('./log/');
  res.render('list.ejs', {files: files});
})

app.get('/chart', (req, res) => {
  res.render('chart.ejs', {fileName: req.query.fileName});
})

app.get('/chartTest', (req, res) => {
  res.render('chart-test.ejs');
})

app.get('/data', (req, res) => {
  fs.readFile('./log/'+ req.query.data, 'utf8', function (err, data) {
    res.json(JSON.parse(data));
  });
  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})