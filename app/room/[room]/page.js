// "use client"
// import { useSocket } from '@/app/context/SocketProvider';
// import peer from '@/app/service/peer';
// import { sendError } from 'next/dist/server/api-utils';
// import { calculateOverrideValues } from 'next/dist/server/font-utils';
// import { Asset } from 'next/font/google';
// import React, { useCallback, useEffect, useState } from 'react'
// import ReactPlayer from 'react-player';

// function Room({ params }) {
//   console.log(params.room);
//   const socket = useSocket();
//   const [myStream, setMyStream] = useState();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [remoteStream, setRemoteStream] = useState();
//   const handlerUserJoined = useCallback((data) => {
//     const { email, id } = data;
//     console.log(email, id)
//     setRemoteSocketId(id);
//   }, []);
//   const handlerCallUser = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
//     setMyStream(stream);
//     const offer = await peer.getOffer();
//     socket.emit("user:call", { to: remoteSocketId, offer })
//     console.log(stream);
//   })
//   const handlerIncommingCall = useCallback(async ({ from, offer }) => {
//     console.log("incoming call", from, offer);
//     setRemoteSocketId(from)
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
//     setMyStream(stream);
//     const answer = await peer.getAnswer(offer);
//     socket.emit("call:accepted", { to: from, answer });

//   }, []);
//   // const SendStream = useCallback(() => {
//   //   for (const track of myStream.getTracks()) {
//   //     peer.peer.addTrack(track, myStream)
//   //   }
//   // }, [myStream])
//   const SendStream = useCallback(() => {
//     if (myStream) {
//       const senders = peer.peer.getSenders();
//       myStream.getTracks().forEach((track) => {
//         const sender = senders.find((s) => s.track && s.track.kind === track.kind);
//         if (sender) {
//           sender.replaceTrack(track);
//         } else {
//           peer.peer.addTrack(track, myStream);
//         }
//       });
//     }
//   }, [myStream]);
  
//   const handlerCallAccepted = useCallback(({ from, answer }) => {
//     console.log("call accepted", from, answer);
//     peer.setLocalDescription(answer);
//     SendStream()
//   }, [SendStream]);
//   const handlerNegoIncomming = useCallback(async ({ from, offer }) => {
//     const answer = await peer.getAnswer(offer);
//     socket.emit("peer:nego:done", { to: from, answer })
//   }, []);
//   const handlerNegoNeedFinal = useCallback(async ({ answer }) => {
//     await peer.setLocalDescription(answer)
//   }, [])
//   useEffect(() => {
//     socket.on("user:joined", handlerUserJoined);
//     socket.on("incomming:call", handlerIncommingCall);
//     socket.on("call:accepted", handlerCallAccepted);
//     // socket.on("call:accepted", handlerCallAccepted);
//     socket.on("peer:nego:needed", handlerNegoIncomming);
//     socket.on("peer:nego:final", handlerNegoNeedFinal)
//     return (() => {
//       socket.off("user:joined", handlerUserJoined);
//       socket.off("incomming:call", handlerIncommingCall);
//       socket.off("call:accepted", handlerCallAccepted);

//       socket.off("peer:nego:needed", handlerNegoIncomming);
//       socket.off("peer:nego:final", handlerNegoNeedFinal)
//     });

//   }, [socket, handlerUserJoined]);
//   useEffect(() => {
//     peer.peer.addEventListener("track", async ev => {
//       console.log(ev);
//       const remoteStream = ev.streams[0];
//       setRemoteStream(remoteStream);
//     })

//   }, [])
//   const handlerNegoNeeded = useCallback(async () => {
//     const offer = await peer.getOffer();
//     socket.emit("peer:nego:needed", { offer, to: remoteSocketId })
//   }, [remoteSocketId, socket])

//   useEffect(() => {
//     peer.peer.addEventListener("negotiationneeded", handlerNegoNeeded)
//     return () => {
//       peer.peer.addEventListener("negotiationneeded", handlerNegoNeeded)
//     }
//   }, [])

//   return (
//     <div>
//       {remoteSocketId ? "connected" : "No one in room"}
//       {}
//       <br></br>
//       {
//         remoteSocketId ? <button onClick={() => {
//           handlerCallUser()
//         }}>Call</button> : ""
//       }
//       {
//         myStream && <ReactPlayer url={myStream} muted playing={true} height={200} width={200}></ReactPlayer>
//       }
//       <div>

            
//             {
//               myStream&&<button onClick={SendStream}>Send Stream</button>
//             }

//         {
//           remoteStream &&
//           <>
//             <h1>Remote Stream</h1>
//             <ReactPlayer url={remoteStream} muted playing={true} height={200} width={200}></ReactPlayer>
//           </>
//         }
//       </div>
//     </div>
//   )
// }

// export default Room
"use client";
import { useSocket } from '@/app/context/SocketProvider';
import peer from '@/app/service/peer';
import React, { useCallback, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';

function Room({ params }) {
  console.log(params.room);
  const socket = useSocket();
  const [myStream, setMyStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handlerUserJoined = useCallback((data) => {
    const { email, id } = data;
    console.log('User Joined:', email, id);
    setRemoteSocketId(id);
  }, []);

  const handlerCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMyStream(stream);
      const offer = await peer.getOffer();
      socket.emit('user:call', { to: remoteSocketId, offer });
      console.log('Local Stream:', stream);
    } catch (error) {
      console.error('Error in handlerCallUser:', error);
    }
  }, [remoteSocketId, socket]);

  const handlerIncommingCall = useCallback(async ({ from, offer }) => {
    try {
      console.log('Incoming call from:', from);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setMyStream(stream);
      const answer = await peer.getAnswer(offer);
      socket.emit('call:accepted', { to: from, answer });
    } catch (error) {
      console.error('Error in handlerIncommingCall:', error);
    }
  }, [socket]);

  const SendStream = useCallback(() => {
    try {
      if (myStream) {
        const senders = peer.peer.getSenders();
        myStream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track && s.track.kind === track.kind);
          if (sender) {
            console.log(`Replacing track: ${track.kind}`);
            sender.replaceTrack(track);
          } else {
            console.log(`Adding track: ${track.kind}`);
            peer.peer.addTrack(track, myStream);
          }
        });
      } else {
        console.log('No stream available to send');
      }
    } catch (error) {
      console.error('Error in SendStream:', error);
    }
  }, [myStream]);

  const handlerCallAccepted = useCallback(({ from, answer }) => {
    try {
      console.log('Call accepted by:', from);
      peer.setLocalDescription(answer);
      SendStream();
    } catch (error) {
      console.error('Error in handlerCallAccepted:', error);
    }
  }, [SendStream]);

  const handlerNegoIncomming = useCallback(async ({ from, offer }) => {
    try {
      const answer = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', { to: from, answer });
    } catch (error) {
      console.error('Error in handlerNegoIncomming:', error);
    }
  }, [socket]);

  const handlerNegoNeedFinal = useCallback(async ({ answer }) => {
    try {
      await peer.setLocalDescription(answer);
    } catch (error) {
      console.error('Error in handlerNegoNeedFinal:', error);
    }
  }, []);

  useEffect(() => {
    socket.on('user:joined', handlerUserJoined);
    socket.on('incomming:call', handlerIncommingCall);
    socket.on('call:accepted', handlerCallAccepted);
    socket.on('peer:nego:needed', handlerNegoIncomming);
    socket.on('peer:nego:final', handlerNegoNeedFinal);

    return () => {
      socket.off('user:joined', handlerUserJoined);
      socket.off('incomming:call', handlerIncommingCall);
      socket.off('call:accepted', handlerCallAccepted);
      socket.off('peer:nego:needed', handlerNegoIncomming);
      socket.off('peer:nego:final', handlerNegoNeedFinal);
    };
  }, [
    socket,
    handlerUserJoined,
    handlerIncommingCall,
    handlerCallAccepted,
    handlerNegoIncomming,
    handlerNegoNeedFinal,
  ]);

  useEffect(() => {
    peer.peer.addEventListener('track', (ev) => {
      console.log('Remote track added:', ev);
      const remoteStream = ev.streams[0];
      setRemoteStream(remoteStream);
    });

    return () => {
      peer.peer.removeEventListener('track', () => {});
    };
  }, []);

  const handlerNegoNeeded = useCallback(async () => {
    try {
      const offer = await peer.getOffer();
      socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    } catch (error) {
      console.error('Error in handlerNegoNeeded:', error);
    }
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handlerNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handlerNegoNeeded);
    };
  }, [handlerNegoNeeded]);

  return (
    <div>
      {remoteSocketId ? 'Connected' : 'No one in room'}
      <br />
      {remoteSocketId && (
        <button onClick={handlerCallUser}>Call</button>
      )}
      {myStream && (
        <ReactPlayer
          url={myStream}
          muted
          playing={true}
          height={200}
          width={200}
        />
      )}
      <div>
        {myStream && (
          <button onClick={SendStream}>Accept Incoming</button>
        )}
        {remoteStream && (
          <>
            <h1>Remote Stream</h1>
            <ReactPlayer
              url={remoteStream}
              muted
              playing={true}
              height={200}
              width={200}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Room;

