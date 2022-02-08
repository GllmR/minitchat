const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const path = require('path')
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./db/minitchat.db', err => {
  if (err) {
    return console.error(err.message)
  }

  console.log('Connected to the minitchat database !')
})
let users = []

app.use(express.static(path.join(__dirname + '/public')))

db.run('CREATE TABLE IF NOT EXISTS messages(text, time, name)')

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
      users = users.filter(u => u !== socket.name)
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