const socket = io()

const chat = document.querySelector('.chat-form')
const msg = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')

let name = document.cookie

while (!name) {
  name = prompt('Enter your name')
    .split(' ')
    .join('')
    .replace(/[aeiouy]/ig, '')
    
  document.cookie = name
}

socket.emit('user', name)

chat.addEventListener('submit', event => {
  event.preventDefault()

  socket.emit('chat', {'name': name, 'text': msg.value})
  msg.value = ''
})

const renderMessage = message => {
  const div = document.createElement('div')
  div.classList.add('render-message')
  if (message.text.split('').join('') !== '') {
    div.innerHTML = `<li class="message"><i class="pseudo">${message.name}</i> - ${message.text}</li>`
  }

  chatWindow.insertBefore(div, chatWindow.childNodes[0])
  div.scrollTop = 0
}

socket.on('chat', message => {
  renderMessage(message)
})
