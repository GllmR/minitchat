// Regex to check link (not mine of course 🤡)
const MAXI_REGEX = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm

// Format date in javascript is 𝔉𝔘𝔑
export function formatDate(rawDate) {
  const date = new Date(rawDate)
  return `${date.toLocaleString('fr-FR', {month: 'numeric', day: 'numeric'})}|${date.toLocaleString('fr-FR', {hour: 'numeric', minute: 'numeric', second: 'numeric'})}`
}

// https://css-tricks.com/snippets/javascript/htmlentities-for-javascript/ ❤️
export function cleanHTML(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Check if it's a link, then add a <a>
export function urlToLink(message) {
  return message.replace(MAXI_REGEX, url => {
    let link = url
    if (!link.match('^https?://')) {
      link = 'http://' + link
    }

    return `<a href="${link}" target="_blank">${url}</a>`
  })
}

// Clean pseudo & remove vowels
export function pseudoMaker(name) {
  return cleanHTML(name).split('').join('').trim().replace(/[aeiouy]/gi, '')
}

/*##########################################################################
# Notification function                                                     #
# Need .notification css class                                              #
# -> string: message to display                                             #
# -> time: how much time displaying notification, default: 3000             #
# -> container: container to display notification, default: document.body   #
 ##########################################################################*/

export function sendNotification(string, time, container) {
  const notification = document.createElement('div')
  const notifications = container || document.body
  notification.classList.add('notification', 'cool-div')
  notification.innerHTML = (string)
  notifications.append(notification)
  setTimeout(() => {
    notification.innerHTML = ''
    notification.classList.add('hidden')
    notification.remove()
  }, time || 3000)
}

// Trim & check if there's a link in the message
export function formatMessage(message) {
  const cleanMessage = cleanHTML(message)
  const arrayMsg = cleanMessage.split(' ')
  const linkArray = []

  arrayMsg.forEach(w => {
    if (MAXI_REGEX.test(w)) {
      linkArray.push(urlToLink(w).trim())
    } else {
      linkArray.push(w.trim())
    }
  })

  return linkArray.join(' ')
}

// Upload file to server & return filename
export async function uploadFile(formData) {
  const res = await fetch('/files', {
    method: "POST",
    body: formData
  })

  if (res.ok) {
    const filename = await res.json()
    return filename
  } else {
    sendNotification(`😱 Oupss... Trop gros...`, null, document.querySelector('.notifications'))
  }
}

// Render message line with date and name
export function renderMessage(message) {
  const div = document.createElement('div')
  const formatedDate = formatDate(message.time)
  div.classList.add('render-message')
  div.innerHTML = `<div class="message">
                    <span class="time">
                      ${formatedDate}
                    </span> ◀︎<span class="pseudo"> ${message.name} </span>▶︎ <span>${message.text}</span>
                  </div>`

  return div
}


/********* File Upload ********\
*     Send file to server      *
*  Transform file path to link *
\******************************/

export function popupUpload(event, container, socket) {
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
}