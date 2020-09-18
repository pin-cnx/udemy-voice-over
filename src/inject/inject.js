let ENGINE = 'wavenet' // wavenet,tts

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
        if (a.parent().next().length === 0) break
        a = a.parent().next().children()
        text = text + ' ' + a.text()
        skip++
        if (skip > 10) return
      }

      if (ENGINE === 'wavenet') {
        // Google text to speech API
        // --------------------------------
        fetchNextVoice(a).then(function () {})
        if (cache_text === text) {
          console.log('QUEUE[CACHE]', text)
          if (!cache_data.hasOwnProperty('engine')) {
            cache_data.engine = 'wavenet'
          }
          if (!cache_data.hasOwnProperty('text')) {
            cache_data.text = text
          }
          queue.enqueue(cache_data)
          //var snd = new Audio('data:audio/x-wav;base64, ' + cache_data.audioContent)
          //snd.play()
        } else {
          jQuery('[data-purpose=\'transcript-cue-active\']').css('color', 'red')
          callT2S(text, function (data, status) {
            if (enable_play) {
              if (!data.hasOwnProperty('text')) {
                data.text = text
              }
              if (!data.hasOwnProperty('engine')) {
                data.engine = 'wavenet'
              }
              queue.enqueue(data)
              console.log('QUEUE[FETCH]', text)
              //var snd = new Audio('data:audio/x-wav;base64, ' + data.audioContent)
              //snd.play()
            }
          }, (error) => {queue.enqueue({text: text, engine: 'tts'})})
        }
        // --------------------------------
      } else {
        // speechSynthesis text to speech
        // --------------------------------
        queue.enqueue({text: text})
      }
    }
  }

  setTimeout('fetchVoice()', 50)
}

let overlapCall = {}

function callT2S (text, callback, errorCallback = null) {
  if (overlapCall.hasOwnProperty(text)) {
    console.log('OVERLAP CALL')
    overlapCall[text].push(callback)
  } else {
    overlapCall[text] = [callback]
    jQuery.ajax({
      'type': 'POST',
      'url': 'https://tts.chiangmaioutsource.com/api/translate',
      'contentType': 'application/json',
      headers: {
        "Authorization": accessToken
      },
      'data': JSON.stringify({input: {text: text}}),
      'dataType': 'json',
      'success': (data, status) => {
        for (let i in overlapCall[text]) {
          overlapCall[text][i](data, status)
        }
        delete overlapCall[text]
      },
      'error': function (error) {
        console.error(error)
        // ENGINE = 'tts'
        delete overlapCall[text]
        if (errorCallback) {errorCallback(error)}
      }
    })
  }
}

// Google text to speech API
// --------------------------------
async function fetchNextVoice (a) {
  a = a.parent().next().children()
  let text = a.text()
  while (text[text.length - 1] !== '.' && text[text.length - 1] !== '?' && text[text.length - 1] !== ',') {
    if (a.parent().next().length === 0) break
    a = a.parent().next().children()
    text = text + ' ' + a.text()
  }
  callT2S(text, function (data, status) {
    console.log('PRELOAD', text)
    cache_text = text
    cache_data = data
  })
}

// --------------------------------

function autoQueuePlay () {
  if (queue.isEmpty()) {
    setTimeout('autoQueuePlay()', 10)
  } else {
    let data = queue.dequeue()

    let engine = data.engine ? data.engine : ENGINE
    let lang = data.lang ? data.lang : 'en-US'

    console.log('PLAY[QUEUE]', [engine, lang, data.text])

    if (engine === 'wavenet') {
      // Google text to speech API
      // --------------------------------
      var snd = new Audio('data:audio/x-wav;base64, ' + data.audioContent)
      const nextPlay = function () {
        autoQueuePlay()
      }
      snd.onended = nextPlay
      snd.onerror = nextPlay
      snd.play()
    } else {
      // speechSynthesis text to speech
      // --------------------------------
      // var voices = window.speechSynthesis.getVoices()
      var msg = new SpeechSynthesisUtterance()
      // msg.voice = voices[0] // Note: some voices don't support altering params
      msg.voiceURI = 'native'
      msg.volume = 1 // 0 to 1
      msg.rate = 1 // 0.1 to 10
      msg.pitch = 0 //0 to 2
      msg.text = data.text
      msg.lang = lang

      msg.onend = function (e) {
        autoQueuePlay()
      }
      speechSynthesis.speak(msg)
      // --------------------------------
    }

  }

}

let queue = new Queue()
let enable_play = false
let lastMsg = ''
let skip = 0
let cache_text = null
let cache_data = null
let accessToken = null
chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)

      // ----------------------------------------------------------
      // This part of the script triggers when page is done loading
      console.log('Hello. This message was sent from scripts/inject.js')
      // ----------------------------------------------------------

      chrome.storage.sync.get({
        accessToken: ''
      }, function (items) {
        accessToken = items.accessToken
      })

      enable_play = true
      fetchVoice()
      autoQueuePlay()

    }
  }, 10)
})