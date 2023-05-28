// script.js

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '0.peerjs.com',
  port: 443,
  secure: true,
  path: '/'
});

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let stream;
var OtherUsername = "";

// Define the myname variable with the desired name



myPeer.on('open', (id) => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((userStream) => {
      stream = userStream;
      addVideoStream(myVideo, stream, id, myname);

      socket.emit('join-room', ROOM_ID, id, myname);

      myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
          addVideoStream(video, userVideoStream, call.peer, myname);
        });
        call.on('close', () => {
          video.remove();
        });

        peers[call.peer] = call;
      });

      socket.on('user-connected', (userId, username) => {
        connectToNewUser(userId, stream, username);
      });

      socket.on('user-disconnected', (userId, username) => {
        if (peers[userId]) peers[userId].close();
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Rest of your code...

socket.on("AddName", (username) => {
  OtherUsername = username;
  const myVideoWrapper = document.getElementById(`video-wrapper-${userId}`);
  if (myVideoWrapper) {
    const nameElement = myVideoWrapper.querySelector('.username');
    if (nameElement) {
      nameElement.innerText = myname;
    }
  }
  console.log(username);
});


function connectToNewUser(userId, stream, myname) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream, userId, myname);
  });
  call.on('close', () => {
    const videoWrapper = document.getElementById(`video-wrapper-${userId}`);
    if (videoWrapper) {
      videoWrapper.remove();
    }
    video.remove();
  });

  peers[userId] = call;
}



function addVideoStream(video, stream, userId, name) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });

  const videoWrapper = document.getElementById(`video-wrapper-${userId}`);
  if (!videoWrapper) {
    const newVideoWrapper = document.createElement('div');
    newVideoWrapper.id = `video-wrapper-${userId}`;
    newVideoWrapper.classList.add('video_wrapper');

    const nameElement = document.createElement('p');
    nameElement.innerText = name;

    newVideoWrapper.appendChild(video);
    newVideoWrapper.appendChild(nameElement);
    videoGrid.append(newVideoWrapper);

  }
}

const wrapper = document.getElementsByClassName('wrapper')[0]; // Get the first element with the "wrapper" class

const video_m = document.createElement('button');
video_m.classList.add('btn', 'btn-outline-secondary');
video_m.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video-fill align" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
</svg> Stop Video`;

video_m.addEventListener('click', () => {
  const videoTrack = myVideo.srcObject.getVideoTracks()[0];
  videoTrack.enabled = !videoTrack.enabled;
  video_m.innerHTML = videoTrack.enabled ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video-fill align" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
</svg> Stop Video` : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor align" class="bi bi-camera-video-off-fill" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"/>
</svg> Start Video`;
});

const mic_m = document.createElement('button');
mic_m.classList.add('btn', 'btn-outline-secondary');
mic_m.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-fill" viewBox="0 0 16 16">
<path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
<path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
</svg> Mute`

mic_m.addEventListener('click', () => {
  const audioTrack = stream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;
  mic_m.innerHTML = audioTrack.enabled ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-fill" viewBox="0 0 16 16">
  <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
  <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
  </svg> Mute` : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic-mute-fill" viewBox="0 0 16 16">
  <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
  <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
</svg> Unmute`;
});

const leaveBtn = document.createElement('button');
leaveBtn.type = 'button';
leaveBtn.classList.add('btn', 'btn-danger');
leaveBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-right align" viewBox="0 0 16 16">
<path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
<path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
</svg> Leave`

// Set the link URL
const linkUrl = '/';

// Add a click event listener to redirect to the link URL
leaveBtn.addEventListener('click', () => {
  window.location.href = linkUrl;
});

// Append the link button to a container element

wrapper.append(video_m, mic_m, leaveBtn, );

