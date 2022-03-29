import {formatMessage, sendNotification, formatDate, renderMessage, uploadFile, pseudoMaker} from './utils.js'

const socket = io()

const container = document.querySelector('#container')
const chat = document.querySelector('.chat-form')
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

/************** Quote function ***************\
* Fill input with double-clicked text or link *
*      Remove it if you don't like it         *
\*********************************************/

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

/************ Emojis event ***************\
* Add onClick on all buttons in container *
*    OnClick set button text to input     *
\*****************************************/

for (const emoji of emojis) {
  emoji.onclick = () => {
    msg.value += ' ' + emoji.textContent + ' '
    msg.focus()
  }
}

/********** Prompt to ask & transform pseudonyme ***********\
* If no name in local storage, open a prompt & ask username *
\***********************************************************/

function askPseudo() {
  const prompt = document.createElement('div')
  container.classList.add('blur')
  prompt.id = 'popupContainer'
  prompt.innerHTML = `
    <form class="popup cool-div">
      <label>
        Entrez votre Nom :
      </label>
      <label for="name">
        <input type="text" name="name" class="submit-input" />
      </label>
      <button type="submit" class="chat-submit">Entrer</button>
    </form>
  `
  document.body.append(prompt)

  prompt.addEventListener('submit', e => {
    e.preventDefault()
    const newName = pseudoMaker(document.querySelector('.submit-input').value)

    if (newName) {
      localStorage.setItem('name', newName)
      name = newName
      socket.emit('getMessages')
      miniChat(socket, newName)
      container.classList.remove('blur')
      prompt.remove()
    }
  })
}

/********* File Upload ********\
*     Send file to server      *
*  Transform file path to link *
\******************************/

fileButton.addEventListener('click', event => {
  container.classList.add('blur')
  const uploader = document.createElement('div')

  uploader.id = 'popupContainer'
  uploader.innerHTML= `
    <form action="/files" enctype="multipart/form-data" method="post" class="popup cool-div">
      <label class="chat-label">
        <input id="file" type="file" name="multipleFiles" multiple="multiple" class="file-input" />
      </label>
      <div class="chat-btn-container">
        <button id="upload" type="button">Partager</button>
        <button id="cancel" type="button">Annuler</button>
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
      uploader.innerHTML = `
        <form class="popup cool-div">
          <image src="img/poulet.png" class="rotate" />
          <p>Téléversement en cours... Patientez !</p>
        </form>
      `
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

/********************************\
* Display users list under input *
\********************************/

function renderUsersList(users) {
  usersList.innerHTML = users.map(user => ' <span>' + user + '</span>')
}

/*******************************\
* |\/| | |\| | ~|~ ( |-| /\ ~|~ *
\*******************************/

function miniChat(socket, name) {
// Send user name to server
  socket.emit('user', name)

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

// Change user’s name color in usersList when typing
  socket.on('isTyping', name => {
    Array.from(usersList.children).find(c => c.innerText === name).classList.add('pseudo')
  })

// Restore color in usersList
  socket.on('stopTyping', name => {
    Array.from(usersList.children).find(c => c.innerText === name).classList.remove('pseudo')
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
    askPseudo()
  }
}

/***************************************************************\
* On submit, clean message, add date then send it to the server *
\***************************************************************/
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

    socket.emit('stopTyping', name)
  }

  msg.value = ''
})

// Listen to input for isTyping event
msg.addEventListener('input', event => {
  if (msg.value !== '') {
    socket.emit('isTyping', name)
  } else {
    socket.emit('stopTyping', name)
  }
})

// Start mini-chat 🎉
start()
