import {formatMessage, sendNotification, formatDate, urlToLink} from './utils.js'

const socket = io()

const chat = document.querySelector('.chat-form')
const msg = document.querySelector('.chat-input')
const chatWindow = document.querySelector('.chat-window')
const usersList = document.querySelector('.users-list')
const notifications = document.querySelector('.notifications')
const permission = Notification.requestPermission(function(){})
let messages

let name = document.cookie?.replace(/[=]/ig, '') || null


/*####################################
# Fill input with clicked text or link #
 #####################################*/

chatWindow.onclick = e => {
  if (e.target.href) {
    return
  }

  if (e.target.className === 'pseudo') {
    msg.value = `‡ ${e.target.innerText} ‡ → `
  } else {
    msg.value = `«${e.target.innerText}» → `
  }

  msg.focus()
}

/*###################################################
# Format & render message line with date and name    #
# Then push message into chat "chatWindow" container #
 ####################################################*/

function renderMessage(message) {
  const div = document.createElement('div')
  div.classList.add('render-message')

  if (message.text !== '') {
    div.innerHTML =
      `<div class="message">
        <span class="time">
          ${message.time}
        </span> ◀︎<span class="pseudo"> ${message.name} </span>▶︎ <span>${message.text}</span>
      </div>`
  }

  messages?.push(message)

  chatWindow.insertBefore(div, chatWindow.childNodes[0])
  div.scrollTop = 0
}

/*###############################
# Display users list under input #
 ################################*/

function renderUsersList(users) {
  usersList.innerHTML = users.map(user => ' ' + user)
}

/*##################
# M I N I - C H A T #
 ###################*/

function miniChat(socket) {
// Send user name to server
  socket.emit('user', name)

// Get messages from server
  socket.on('setMessages', msgs => {
    if (messages?.length !== msgs.length) {
      msgs.map(msg => {
        renderMessage(msg)
      })

      messages = msgs
    }
  })

// Update message list on new message
  socket.on('chat', message => {
    renderMessage(message)

    if (permission && document.hidden) { // Check if window focus to send notification
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
}

// 🍪 Ask for username 𝕱𝕺𝕽𝕰𝖁𝕰𝕽 then 🅡🅔🅛🅞🅐🅓 🤡
if (!name) {
  name = prompt('Enter your name')
    .split(' ')
    .join('')
    .replace(/[aeiouy]/ig, '')

  document.cookie = name
  window.location.reload() // 🤷
}

/*#############################################################
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
miniChat(socket)
