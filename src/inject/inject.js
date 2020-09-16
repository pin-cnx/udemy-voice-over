class Queue {
  constructor () {
    this.data = []
    this.rear = 0
    this.size = 10
  }

  enqueue (element) {
    if (this.rear < this.size) {
      this.data[this.rear] = element
      this.rear = this.rear + 1
    }
  }

  length () {
    return this.rear
  }

  isEmpty () {
    return this.rear === 0
  }

  dequeue () {
    if (this.isEmpty() === false) {
      this.rear = this.rear - 1
      return this.data.shift()
    }
  }

}

function fetchVoice () {
  let a = jQuery('[data-purpose=\'transcript-cue-active\']')
  let text = a.text()
  if (text !== '' && lastMsg !== text) {
    lastMsg = text
    if (skip > 0) {
      skip--
    } else {
      while (text[text.length - 1] !== '.' && text[text.length - 1] !== '?' && text[text.length - 1] !== ',') {
        a = a.parent().next().children()
        text = text + ' ' + a.text()
        skip++
        if (skip > 10) return
      }

      // speechSynthesis text to speech
      // --------------------------------
      queue.enqueue({text: text})

      // Google text to speech API
      // --------------------------------
      // if (cache_text === text) {
      //   console.log('queue cache', text)
      //   cache_data.text = text
      //   queue.enqueue(cache_data)
      //   //var snd = new Audio('data:audio/x-wav;base64, ' + cache_data.audioContent)
      //   //snd.play()
      // } else {
      //   jQuery('[data-purpose=\'transcript-cue-active\']').css('color', 'red')
      //   jQuery.post('http://localhost:8000/api/translate', {text: text}, function (data, status) {
      //     if (enable_play) {
      //       data.text = text
      //       queue.enqueue(data)
      //       console.log('queue fetch', text)
      //       //var snd = new Audio('data:audio/x-wav;base64, ' + data.audioContent)
      //       //snd.play()
      //     }
      //   }, 'json')
      // }
      // --------------------------------
    }
  }

  setTimeout('fetchVoice()', 50)
}

// Google text to speech API
// --------------------------------
// if (cache_text === text) {
// async function fetchNextVoice (a) {
//   a = a.parent().next().children()
//   let text = a.text()
//   while (text[text.length - 1] !== '.' && text[text.length - 1] !== '?' && text[text.length - 1] !== ',') {
//     a = a.parent().next().children()
//     text = text + ' ' + a.text()
//   }
//
//   jQuery.post('http://localhost:8000/api/translate', {text: text}, function (data, status) {
//     console.log('prepared', text)
//     cache_text = text
//     cache_data = data
//   }, 'json')
// }
// --------------------------------


function autoQueuePlay () {
  if (queue.isEmpty()) {
    setTimeout('autoQueuePlay()', 10)
  } else {
    let data = queue.dequeue()
    console.log('play queue', data.text)

    // Google text to speech API
    // --------------------------------
    // var snd = new Audio('data:audio/x-wav;base64, ' + data.audioContent)
    // snd.onended = function () {
    //   autoQueuePlay()
    // }
    // snd.play()

    // speechSynthesis text to speech
    // --------------------------------
    var voices = window.speechSynthesis.getVoices()
    var msg = new SpeechSynthesisUtterance()
    msg.voice = voices[0] // Note: some voices don't support altering params
    msg.voiceURI = 'native'
    msg.volume = 1 // 0 to 1
    msg.rate = 1 // 0.1 to 10
    msg.pitch = 0 //0 to 2
    msg.text = data.text
    msg.lang = 'en-US'

    msg.onend = function (e) {
      autoQueuePlay()
    }
    // --------------------------------

    speechSynthesis.speak(msg)
  }

}

let queue = new Queue()
let enable_play = false
let lastMsg = ''
let skip = 0
let cache_text = null
let cache_data = null

chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log('Hello. This message was sent from scripts/inject.js')
      // ----------------------------------------------------------

      enable_play = true
      fetchVoice()
      autoQueuePlay()

    }
  }, 10)
})