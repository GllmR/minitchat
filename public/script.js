const socket = io()

const chat = document.querySelector('.chat-form')
const msg = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const permission = Notification.requestPermission(function(){})
let messages
const MAXI_REGEX = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm

let name = document.cookie?.replace(/[=]/ig, '')

function urlToLink(text) {
    return text.replace(MAXI_REGEX, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    })
}

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
  const date = new Date()

  if (msg.value.split('').join('').trim() !== '') {
    socket.emit('chat', {
      'name': name,
      'text': msg.value,
      time: date.toLocaleString('fr-FR',{month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'})
    })
  }

  msg.value = ''
})

const renderMessage = message => {
  const div = document.createElement('div')
  div.classList.add('render-message')
  if (message.text !== '') {
    let msg

    if (MAXI_REGEX.test(message.text)) {
      msg = urlToLink(message.text.trim())
    } else {
      msg = message.text.trim()
    }

    div.innerHTML = `<div class="message"><span class="time">${message.time}</span> | <span class="pseudo"> ${message.name} </span> : <span>${msg}</span></div>`
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

socket.on('leave', usr => {
  socket.emit('chat', {'name': '<img src="/img/poulet.png" class="icon" />', text: `Au revoir ${usr}`, time: ''})
})
