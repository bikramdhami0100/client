"use client";
import { useCallback, useEffect, useState } from "react";
import {useSocket} from "./context/SocketProvider"
import { useRouter } from "next/navigation";
export default function Home() {
  const router=useRouter()
  const [email, setEmail] = useState(""); // State for email
  const [roomId, setRoomId] = useState(""); // State for room ID
const socket= useSocket();
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    socket.emit("room:join",{email,roomId})
    console.log("Email:", email);
    console.log("Room ID:", roomId);
    // Add your further form submission logic here
  },[email,roomId,socket]);
  const handleJoinRoom=useCallback((data)=>{
    const {email,room}=data;
    console.log(email,room);
  },[])
 useEffect(() => {
   socket.on("room:join",handleJoinRoom)
 
   return () => {
    //  second
    socket.off("room:join",handleJoinRoom)
   }
 }, [socket])
 
  return (
    <div className="flex text-black justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-8 flex flex-col items-center"
      >
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">
          Join Room (WebRTC)
        </h1>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded-md mb-4 w-64 border border-gray-300"
          placeholder="Enter email"
          required
        />
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="p-3 rounded-md mb-4 w-64 border border-gray-300"
          placeholder="Enter Room ID"
          required
        />
        <button
           onClick={()=>{
             router.push(`/room/${roomId}`)
           }}
          type="submit"
          className="bg-blue-600 text-white p-3 w-full rounded-md hover:bg-blue-700 transition duration-300"
        >
          join Now
        </button>
      </form>
    </div>
  );
}
