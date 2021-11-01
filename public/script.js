const socket = io()

const chat = document.querySelector('.chat-form')
const msg = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const permission = Notification.requestPermission(function(){})
const date = new Date()
let messages

let name = document.cookie?.replace(/[=]/ig, '')

while (!name) {
  name = prompt('Enter your name')
    .split(' ')
    .join('')
    .replace(/[aeiouy]/ig, '')
    
  document.cookie = name
}

socket.emit('user', name)

socket.on('newUser', msgs => {
  if (messages?.length !== msgs.length) {
    msgs.map(msg => {
      renderMessage(msg)
    })

    socket.emit('chat', {'name': '<img src="/img/poulet.png" class="icon" />', text: `Bienvenue ${name}`, time: ''})

    messages = msgs
  }
})

chat.addEventListener('submit', event => {
  event.preventDefault()

  socket.emit('chat', {'name': name, 'text': msg.value, time: date.toLocaleString('fr-FR',{month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'})})
  msg.value = ''
})

const renderMessage = message => {
  const div = document.createElement('div')
  div.classList.add('render-message')
  if (message.text.split('').join('') !== '') {
    div.innerHTML = `<div class="message"><span class="time">${message.time}</span>| <span class="pseudo"> ${message.name} </span> : <span>${message.text}</span></div>`
  }

  messages?.push(message)

  chatWindow.insertBefore(div, chatWindow.childNodes[0])
  div.scrollTop = 0

  if (permission && document.hidden) {
    new Notification(message.name, { body: message.text.toString(), icon: './img/poulet.png'})
  }
}

socket.on('chat', message => {
  renderMessage(message)
})
