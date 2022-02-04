import {formatMessage, sendNotification, formatDate, urlToLink, renderMessage} from './utils.js'

const socket = io()

const chat = document.querySelector('.chat-form')
const prompt = document.querySelector('.chat-prompt')
const msg = document.querySelector('.chat-input')
const nameSetter = document.querySelector('.submit-input')
const chatWindow = document.querySelector('.chat-window')
const usersList = document.querySelector('.users-list')
const emojis = document.querySelectorAll('.chat-btn')
const notifications = document.querySelector('.notifications')

// Check if a name is in the localstorage
let name = localStorage.getItem('name') || null

/*#############################################
# Fill input with double-clicked text or link #
# Remove it if you don't like it              #
 ############################################*/

chatWindow.ondblclick = e => {
  if (e.target.href || e.target.className === 'chat-window') {
    return
  }

  if (e.target.className === 'pseudo') {
    msg.value = `‡ ${e.target.innerText} ‡ → `
  } else {
    msg.value = `« ${e.target.innerText} » → `
  }

  msg.focus()
}

 /************ Emojis event *************\
* Add onClick on all buttons in container *
* OnClick set button text to input        *
 \***************************************/

for (let emoji of emojis) {
  emoji.onclick = () => {
    msg.value += ' ' + emoji.textContent + ' '
    msg.focus()
  }
}

/*###############################
# Display users list under input #
 ################################*/

function renderUsersList(users) {
  usersList.innerHTML = users.map(user => ' ' + user)
}

/*******************************\
* |\/| | |\| | ~|~ ( |-| /\ ~|~ *
\*******************************/

function miniChat(socket, name) {
// Send user name to server
  socket.emit('user', name)

// Remove blur class && prompt div
  document.getElementById('start').remove()
  document.getElementById('container').classList.remove('blur')

// Get messages from server
  socket.on('setMessages', msgs => {
    msgs.reverse().map(msg => {
      chatWindow.insertBefore(renderMessage(msg), chatWindow.childNodes[0])
      chatWindow.scrollTop = chatWindow.scrollHeight
    })
  })

// Update message list on new message
  socket.on('chat', message => {
    chatWindow.insertBefore(renderMessage(message), chatWindow.childNodes[0])
    chatWindow.scrollTop = chatWindow.scrollHeight

    if (document.hidden && Notification.requestPermission(function(){})) { // Check if window focus to send notification
      new Notification(message.name, { body: message.text.toString(), icon: './img/poulet.png'})
    }
  })

// Welcome user notification & update user list
  socket.on('newUser', ({name, users}) => {
    sendNotification(`👋 Bonjour ${name}`, null, notifications)
    renderUsersList(users)
  })

// Leaving user notification & update user list
  socket.on('leave', ({name, users}) => {
    sendNotification(`👋 Au revoir ${name}`, null, notifications)
    renderUsersList(users)
  })

// Hello to stalker
  console.log('%cTu regardes quoi ' + name + ' ?', 'color: deeppink; background-color: black; border: 1px solid lime; font-size: 3vw; margin: 8px;')
}

// 🍪 Ask for username 𝕱 𝕺 𝕽 𝕰 𝖁 𝕰 𝕽 👾
function start() {
  if (name && name !== 'null') {
    miniChat(socket, name)
  } else {
    prompt.addEventListener('submit', e => {
      e.preventDefault()
      name = nameSetter?.value.split('').join('').replace(/[aeiouy]/ig, '')

      if (name && name !== 'null' && name !== '') {
        localStorage.setItem('name', name)
        socket.emit('getMessages')
        miniChat(socket, name)
      }
    })
  }
}

/*##############################################################
# On submit, clean message, add date then send it to the server #
 ##############################################################*/
chat.addEventListener('submit', event => {
  event.preventDefault()
  const date = new Date()

  if (msg.value.split('').join('').trim() !== '') {
    const cleanMessage = formatMessage(msg.value)

    socket.emit('chat', {
      'name': name,
      'text': cleanMessage,
      time: formatDate(date)
    })
  }

  msg.value = ''
})

// Start mini-chat 🎉
start()
