import {renderMessage} from '../utils.js'
const search = document.querySelector('#search')
const input = document.querySelector('#input')
const results = document.querySelector('#results')

async function getSearch(search) {
  const result = await fetch(`http://localhost:3000/search/${search}`)
  const data = await result.json()

  return data
}

search.addEventListener('click', async event => {
  event.preventDefault()

  if (input.value.trim()) {
    results.innerHTML = ''
    const response = await getSearch(input.value)
    response.forEach(r => {
      results.appendChild(renderMessage(r))
    })

    input.value = ''
  } else {
    results.appendChild('<div>Pas de résultat !</div>')
  }
})

