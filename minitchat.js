const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')
const formidable = require('formidable')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/minitchat.db', err => {
  if (err) {
    return console.error(err.message)
  }

  console.log('Connected to the minitchat database !')
})
let users = []

function removeItemOnce(arr, value) {
  const index = arr.indexOf(value)
  if (index > -1) {
    arr.splice(index, 1)
  }

  return arr
}

app.use(express.static(path.join(__dirname + '/public')))

app.route('/files')
  .get((req, res) => {
    res.redirect(`/liens`)
  })
  .post((req, res, next) => {
    const form = formidable({
      uploadDir: `${__dirname}/public/files`,
      keepExtensions: true,
      maxFileSize: 10000000,
      filename: (name, ext, part, form) => {
        return part.originalFilename.replaceAll(' ', '_')
      }
    })

    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err)
        return
      }

      res.json(String(files.file.newFilename))
    })
  })

db.run('CREATE TABLE IF NOT EXISTS messages(text, time, name)')

app.all('/pseudo/:pseudo', (req, res) => {
  db.all(`SELECT * FROM messages WHERE name = ?`, [req.params.pseudo], (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message})
      return
    }

    res.status(200).json(rows)
  })
})

app.get('/all', (req, res) => {
  db.all(`SELECT * FROM 'messages'`, [], (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message})
      return
    }

    res.status(200).json(rows)
  })
})

app.all('/search/:word', (req, res) => {
  const search = [req.params.word]

  db.all(`SELECT * FROM messages where text LIKE ?`, `%${search}%`, (err, rows) => {
    if (err) {
      res.status(400).json({"error": err.message})
      return
    }

    res.status(200).json(rows)
  })
})

io.on('connection', socket => {
// Display  number of connected users
  console.log(io.engine.clientsCount)

// On user connexion, add name to names array
// Then send name & user list to client
  socket.on('user', name => {
    socket.name = name
    users.push(name)
    io.emit('newUser', {name, users})

    socket.on('disconnect', () => {
      users = removeItemOnce(users, socket.name)
      io.emit('leave', {name: socket.name, users})
    })
  })

  socket.on('getMessages', () => {
    db.all('SELECT * FROM messages ORDER BY time DESC LIMIT 100', [], (err, messages) => {
      io.emit('setMessages', messages.reverse())
    })
  })

  socket.on('chat', message => {
    db.run(`INSERT INTO messages(text, time, name) VALUES (?, ?, ?)`, [message.text, message.time, message.name], err => {
      if (err) {
        throw err
      }
    })

    io.emit('chat', message)
  })

  socket.on('isTyping', name => {
    io.emit('isTyping', name)
  })

  socket.on('stopTyping', name => {
    io.emit('stopTyping', name)
  })

// Get All messages containing "<a href="
  socket.on('getLinks', () => {
    db.all(`SELECT * FROM messages WHERE text GLOB '*<a href=*'`, [], (err, links) => {
      if (err) {
        throw err
      }

      io.emit('allLinks', (links))
    })
  })
})

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})