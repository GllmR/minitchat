const express = require('express')
const app = express()
const server = require('http').createServer(app)
const port = process.env.PORT || 3000
const io = require('socket.io')(server)
const MongoClient = require('mongodb').MongoClient
const url = "mongodb://localhost:27017/"
const path  = require('path')

app.use(express.static(path.join(__dirname + '/public')))

MongoClient.connect(url, function(err, db) {
  if (err) throw err
  const dbo = db.db('miniChat')

  if (!dbo.collection('messages')) {
    console.log('Collection initialisation...')
    dbo.createCollection("messages", (err, res) => {
      if (err) throw err
      console.log("Collection created !")
      db.close()
    })
  }

  io.on('connection', socket => {
    console.log('Some client connected')
    dbo.collection('messages').find({}).toArray((err, res) => {
      if (err) throw err
      io.emit('newUser', res)
   })

    socket.on('chat', message => {
      console.log('From client: ', message)
      dbo.collection("messages").insertOne(message, (err, res) => {
        if (err)  throw err
      })

      io.emit('chat', message)

      socket.on('chat', message => {
        console.log('From server: ', message)
      })
    })

    socket.on('disconnect', () => {
      console.log('Someone disconnected')
    })
  })

  server.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
  })
})
