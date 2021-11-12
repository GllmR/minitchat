const socket = io()

const chat = document.querySelector('.chat-form')
const msg = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const permission = Notification.requestPermission(function(){})
let messages
const MAXI_REGEX = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm

let name = document.cookie?.replace(/[=]/ig, '')

function urlToLink(message) {
  return message.replace(MAXI_REGEX, function (url) {
    let link = url;
    if (!link.match('^https?:\/\/')) {
      link = 'http://' + link;
    }
    return `<a href="${link}" target="_blank">${url}</a>`
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

    socket.emit('chat', {'name': '<img src="/img/poulet.png" class="icon" />', text: `Bonjour <span class="pseudo"> ${name} </span>`, time: ''})

    messages = msgs
  }
})

chat.addEventListener('submit', event => {
  event.preventDefault()
  const date = new Date()

  if (msg.value.split('').join('').trim() !== '') {
    let cleanMessage

    if (MAXI_REGEX.test(msg.value)) {
      console.log('link')
      cleanMessage = urlToLink(msg.value.trim())
    } else {
      cleanMessage = msg.value.replaceAll(/<[^>]*>/g, '')
    }

    socket.emit('chat', {
      'name': name,
      'text': cleanMessage,
      time: `${date.toLocaleString('fr-FR',{month: 'numeric', day: 'numeric'})}|${date.toLocaleString('fr-FR',{hour: 'numeric', minute: 'numeric', second: 'numeric'})}`
    })
  }

  msg.value = ''
})

const renderMessage = message => {
  const div = document.createElement('div')
  div.classList.add('render-message')

  if (message.text !== '') {
    div.innerHTML = `<div class="message"><span class="time">${message.time}</span> ◀︎<span class="pseudo"> ${message.name} </span>▶︎ <span>${message.text}</span></div>`
  }

  messages?.push(message)

  chatWindow.insertBefore(div, chatWindow.childNodes[0])
  div.scrollTop = 0
}

socket.on('chat', message => {
  renderMessage(message)

  if (permission && document.hidden) {
    new Notification(message.name, { body: message.text.toString(), icon: './img/poulet.png'})
  }
})

socket.on('leave', msgs => {
  if (messages?.length !== msgs.length) {
    msgs.map(msg => {
      renderMessage(msg)
    })

    messages = msgs
  }
})
