import {formatMessage, sendNotification, formatDate, renderMessage, uploadFile} from './utils.js'

const socket = io()

const container = document.querySelector('#container')
const chat = document.querySelector('.chat-form')
const prompt = document.querySelector('.chat-prompt')
const msg = document.querySelector('.chat-input')
const nameSetter = document.querySelector('.submit-input')
const chatWindow = document.querySelector('.chat-window')
const usersList = document.querySelector('.users-list')
const emojis = document.querySelectorAll('.chat-btn')
const notifications = document.querySelector('.notifications')
const fileButton = document.querySelector('.file-submit')
let messages = []

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

for (const emoji of emojis) {
  emoji.onclick = () => {
    msg.value += ' ' + emoji.textContent + ' '
    msg.focus()
  }
}

/********* File Upload ********\
*     Send file to server      *
*  Transform file path to link *
\******************************/

fileButton.addEventListener('click', event => {
  container.classList.add('blur')
  const uploader = document.createElement('div')

  uploader.id = 'fullscreen'
  uploader.innerHTML= `
    <form action="/files" enctype="multipart/form-data" method="post" class="uploader">
      <input id="file" type="file" name="multipleFiles" multiple="multiple" class="file-input" />
      <div class="chat-btn-container">
        <input id="upload" type="button" value="Partager" class="file-submit" />
        <input id="cancel" type="button" value="Annuler" class="file-submit" />
      </div>
    </form>
  `
  document.body.append(uploader)

  document.querySelector('#cancel').addEventListener('click', () => {
    container.classList.remove('blur')
    uploader.remove()
  })

  document.querySelector('#upload').addEventListener('click', async e => {
    e.preventDefault()
    const fileInput = document.querySelector('#file')
    const formData = new FormData()

    if (fileInput.files.length > 0 && fileInput.files[0].type !== 'text/html') {
      formData.append('file', fileInput.files[0])
      const file = await uploadFile(formData)
      container.classList.remove('blur')
      uploader.remove()

      if (file) {
        socket.emit('chat', {
          name,
          text: `<a href="/files/${file}" target="_blank">${file}</a>`,
          time: new Date()
        })
      }
    }
  })
})

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
  document.querySelector('#fullscreen').remove()
  container.classList.remove('blur')

// Get messages from server
  socket.on('setMessages', msgs => {
    if (messages?.length !== msgs.length) {
      msgs.forEach(msg => {
        chatWindow.insertBefore(renderMessage(msg), chatWindow.childNodes[0])
      })
      
      chatWindow.scrollTop = chatWindow.scrollHeight
    }

    messages = msgs
  })

// Update message list on new message
  socket.on('chat', message => {
    messages?.push(message)

    chatWindow.insertBefore(renderMessage(message), chatWindow.childNodes[0])
    chatWindow.scrollTop = chatWindow.scrollHeight

    if (document.hidden && Notification.requestPermission(() => {})) { // Check if window focus to send notification
      new Notification(message.name, {body: message.text.toString(), icon: './img/poulet.png'})
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
  console.log('%cTu regardes quoi ' + name + ' ?', 'color: deeppink; background-color: black; border: 1px solid lime; font-size: 3vw; padding: 2%; margin-bottom: 25px;')
}

// 🍪 Ask for username 𝕱 𝕺 𝕽 𝕰 𝖁 𝕰 𝕽 👾
function start() {
  if (name && name !== 'null') {
    socket.emit('getMessages')
    miniChat(socket, name)
  } else {
    prompt.addEventListener('submit', e => {
      e.preventDefault()
      name = nameSetter?.value.split('').join('').trim().replace(/[aeiouy]/gi, '')

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
  const cleanMessage = formatMessage(msg.value)

  if (cleanMessage.split('').join('').trim() !== '') {
    socket.emit('chat', {
      name,
      text: cleanMessage,
      time: date
    })
  }

  msg.value = ''
})

// Start mini-chat 🎉
start()
