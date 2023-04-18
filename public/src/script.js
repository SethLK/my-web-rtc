const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: 3000,
  path: '/peerjs'
});

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

myPeer.on('open', id => {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    addVideoStream(myVideo, stream);

    socket.emit('join-room', ROOM_ID, id);

    myPeer.on('call', call => {
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
      call.on('close', () => {
        video.remove();
      });

      peers[call.peer] = call;
    });

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    });

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close();
    });
  }).catch(error => {
    console.log(error);
  });
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

// function addVideoStream(video, stream) {
//   video.srcObject = stream;
//   video.addEventListener('loadedmetadata', () => {
//     video.play();
//   });
//   mic_and_video()
//   videoGrid.append(video);
// }

// function mic_and_video() {
//   const controls = document.createElement('div');
//   controls.classList.add('controls');
  
//   const muteButton = document.createElement('button');
//   muteButton.innerText = 'Mute';
//   muteButton.addEventListener('click', () => {
//     stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
//     muteButton.innerText = stream.getAudioTracks()[0].enabled ? 'Mute' : 'Unmute';
//   });
//   controls.appendChild(muteButton);

//   const videoButton = document.createElement('button');
//   videoButton.innerText = 'Stop Video';
//   videoButton.addEventListener('click', () => {
//     stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
//     videoButton.innerText = stream.getVideoTracks()[0].enabled ? 'Stop Video' : 'Start Video';
//   });
//   controls.appendChild(videoButton);

//   videoGrid.appendChild(controls);
// }


function addVideoStream(video, stream) {
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('video-container');
  
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoContainer.appendChild(video);

  const controls = document.createElement('div');
  controls.classList.add('controls');
  
  const muteButton = document.createElement('button');
  muteButton.innerText = 'Mute';
  muteButton.addEventListener('click', () => {
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    muteButton.innerText = stream.getAudioTracks()[0].enabled ? 'Mute' : 'Unmute';
  });
  controls.appendChild(muteButton);

  const videoButton = document.createElement('button');
  videoButton.innerText = 'Stop Video';
  videoButton.addEventListener('click', () => {
    stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;
    videoButton.innerText = stream.getVideoTracks()[0].enabled ? 'Stop Video' : 'Start Video';
  });
  controls.appendChild(videoButton);

  videoContainer.appendChild(controls);
  videoGrid.appendChild(videoContainer);
}
