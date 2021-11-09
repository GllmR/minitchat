const socket = io()

const chat = document.querySelector('.chat-form')
const msg = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const permission = Notification.requestPermission(function(){})
let messages
const MAXI_REGEX = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal|fr|io|ml|tk))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi

let name = document.cookie?.replace(/[=]/ig, '')

function urlToLink(string) {
  return string.replace(MAXI_REGEX, url => {
    const adresse = /[a-z]+:\/\//.test(url) ? url : `http://${url}`
    const newUrl = url.replace(/^https?:\/\//, '')

    return `<a href='${adresse}' target='_blank'>${newUrl}</a>`
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
