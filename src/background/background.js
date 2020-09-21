function parse (d) {
  var a = d.split('\n')
  var i = a[0].indexOf(' --> ')
  var t = a[1]
  if (a[2]) { t += ' ' + a[2] }
  t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return {
    begin: seconds(a[0].substr(0, i)),
    btext: a[0].substr(3, i - 7),
    end: seconds(a[0].substr(i + 5)),
    text: t
  }
}

function seconds (s) {
  var a = s.split(':')
  var r = Number(a[a.length - 1]) + Number(a[a.length - 2]) * 60
  if (a.length > 2) {
    r += Number(a[a.length - 3]) * 3600
  }
  return r
}

let lastVTT = null
chrome.webRequest.onCompleted.addListener(
  function (details) {


    // https://www.udemy.com/api-2.0/users/me/subscribed-courses/3320564/lectures/20977990/?fields[lecture]=asset,description,download_url,is_free,last_watched_second&fields[asset]=asset_type,length,stream_urls,captions,thumbnail_sprite,slides,slide_urls,download_urls
    if (details.url.indexOf('/lectures/') > 0) {
      console.log('onCompleted', details)
    }
    // "https://vtt-a.udemycdn.com/27109916/en_US/2020-08-30_03-34-53-18af366adbff2eca8c7e91b0ee35db06.vtt?vGGvZ7mNsPyqx3EI8i_bdTxMCs9ArtXLiGkHdYK3sN1Ha04-cV7ftInYGbvh1oIG5Fcf-PEs4WymJ3h5pdxS6-6P2Wfa4fKhGv9xFQzYJ3JI_Dh9HhkXoFCYv3m_9l4khbub7mpDVjx9r_A-qx2tQ0Y-mkrgDoSmeWcpjLIW9RrXi9RDn8g"
    if (details.url.indexOf('//vtt') > 0) {
      if (lastVTT !== details.url) {
        lastVTT = details.url


        // fetch(details.url).then(r => r.text())
        //   .then(textData => console.log(textData));
        //


        // Promise.all([
        //   new Promise((resolve) => fetch(details.url).then(r => r.text()).then(t => resolve(t)))
        // ])
        //   .then(textData => textData.map(t => t.split('\n\n').splice(1).map(s => parse(s))))
        //   .then(parsedData => {
        //     captions = parsedData[0]
        //     console.log('captions', captions)
        //   })
        //
        // console.log('onCompleted', details)
      }
    }

    // chrome.devtools.inspectedWindow.eval(
    //   'console.log("text/vtt: " + unescape("' +
    //   escape(request.request.url) + '"))')
    //
    // // if (request.response.contentType === 'text/vtt') {
    // //   console.log(request.response.body)
    // //
    // // }
  },
  {urls: ['<all_urls>']}
)

//
// jwplayer().on('time', function(e) {
//   var p = e.position;
//   for(let j = 0; j<captions.length; j++) {
//     if(captions[j].begin < p && captions[j].end > p) {
//       if(j != caption) {
//         var c = document.getElementById(`caption${j}`);
//         if(caption > -1) {
//           document.getElementById(`caption${caption}`).className = "";
//         }
//         c.className = "current";
//         if(query == "") {
//           transcript.scrollTop = c.offsetTop - transcript.offsetTop - 40;
//         }
//         caption = j;
//       }
//       break;
//     }
//   }
// });
