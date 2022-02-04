const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const MongoClient = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017/'
const path = require('path')

app.use(express.static(path.join(__dirname + '/public')))

MongoClient.connect(url, (err, db) => {
  if (err) {
    throw err
  }

  const dbo = db.db('miniChat')
  let users = []

// check if database exists, if not create it
  if (!dbo.collection('messages')) {
    console.log('Collection initialisation...')
    dbo.createCollection('messages', err => {
      if (err) {
        throw err
      }

      console.log('Collection created !')
      db.close()
    })
  }

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

// Send messages to client
    dbo.collection('messages').find({}).sort({_id: -1}).limit(100).toArray((err, res) => {
      if (err) {
        throw err
      }

      io.emit('setMessages', res)
    })

    socket.on('getMessages', () => {
      dbo.collection('messages').find({}).sort({_id: -1}).limit(100).toArray((err, res) => {
        if (err) {
          throw err
        }

        io.emit('setMessages', res)
      })
    })

    socket.on('chat', message => {
      console.log('From client :', message)
      dbo.collection('messages').insertOne(message, err => {
        if (err) {
          throw err
        }
      })

      io.emit('chat', message)
    })

// Get all messages conataining "href"
    socket.on('getLinks', () => {
      dbo.collection('messages').find({text: {$regex: '.*href.*'}}).toArray((err, res) => {
        if (err) {
          throw err
        }

        io.emit('allLinks', res)
      })
    })
  })

  server.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
})
