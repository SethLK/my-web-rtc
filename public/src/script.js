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
let stream; // Declare the stream variable here

myPeer.on('open', (id) => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((userStream) => {
      stream = userStream; // Assign the stream to the variable

      addVideoStream(myVideo, stream);

      socket.emit('join-room', ROOM_ID, id);

      myPeer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
        call.on('close', () => {
          video.remove();
        });

        peers[call.peer] = call;
      });

      socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
      });

      socket.on('user-disconnected', (userId) => {
        if (peers[userId]) peers[userId].close();
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

const wrapper = document.getElementsByClassName('wrapper')[0]; // Get the first element with the "wrapper" class

const video_m = document.createElement('button');
video_m.innerText = 'Stop Video';
video_m.addEventListener('click', () => {
  const videoTrack = myVideo.srcObject.getVideoTracks()[0];
  videoTrack.enabled = !videoTrack.enabled;
  video_m.innerText = videoTrack.enabled ? 'Stop Video' : 'Start Video';
});

const mic_m = document.createElement('button');
mic_m.innerText = 'Mute';
mic_m.addEventListener('click', () => {
  const audioTrack = stream.getAudioTracks()[0];
  audioTrack.enabled = !audioTrack.enabled;
  mic_m.innerText = audioTrack.enabled ? 'Mute' : 'Unmute';
});

wrapper.append(video_m, mic_m);
