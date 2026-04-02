import { useState, useEffect, useContext, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { signOut } from "firebase/auth";

function Chat() {
  const { currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const messagesEndRef = useRef(null);

  if (!currentUser) return null;

  // 🔥 realtime users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        if (doc.data().uid !== currentUser.uid) {
          list.push(doc.data());
        }
      });
      setUsers(list);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getChatId = (uid1, uid2) => {
    return uid1 < uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;
  };

  // 🔥 realtime messages
  useEffect(() => {
    if (!selectedUser) return;

    const chatId = getChatId(currentUser.uid, selectedUser.uid);

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;

    const chatId = getChatId(currentUser.uid, selectedUser.uid);

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: message,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    setMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = async () => {
    await updateDoc(doc(db, "users", currentUser.uid), {
      isOnline: false,
    });
    await signOut(auth);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitial = (email) => email?.charAt(0).toUpperCase();

  return (
    <div className="h-screen flex bg-[#0f172a] text-white">
      
      {/* Sidebar */}
      <div className="w-[320px] bg-[#111827] flex flex-col border-r border-gray-700">
        
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <span>{currentUser.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-2 py-1 text-xs rounded"
          >
            Logout
          </button>
        </div>

        <div className="p-2 overflow-y-auto flex-1">
          {users.map((user) => (
            <div
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              className={`p-3 rounded mb-1 cursor-pointer ${
                selectedUser?.uid === user.uid
                  ? "bg-blue-600"
                  : "hover:bg-gray-700"
              }`}
            >
              {user.email}
              <div className="text-xs text-gray-400">
                {user.isOnline ? "Online" : "Offline"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        
        <div className="p-4 bg-[#111827] border-b border-gray-700">
          {selectedUser ? selectedUser.email : "Select a user"}
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;

            return (
              <div
                key={msg.id}
                className={`mb-2 ${
                  isMe ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block px-3 py-2 rounded ${
                    isMe ? "bg-blue-500" : "bg-gray-700"
                  }`}
                >
                  {msg.text}
                  <div className="text-xs opacity-70">
                    {formatTime(msg.createdAt)}
                  </div>
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

        <div className="p-4 flex gap-2 bg-[#111827]">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 bg-gray-700 rounded"
            placeholder="Type message..."
          />
          <button
            onClick={handleSend}
            disabled={!selectedUser}
            className="bg-blue-500 px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;