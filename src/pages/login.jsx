import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🔥 set online
      await updateDoc(doc(db, "users", res.user.uid), {
        isOnline: true,
      });

      navigate("/");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        alert("User not found. Please sign up.");
      } else if (err.code === "auth/wrong-password") {
        alert("Wrong password.");
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded w-80">
        <h2 className="text-white text-xl mb-4">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 bg-gray-700 text-white rounded"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 bg-gray-700 text-white rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-500 p-2 rounded text-white">
          Login
        </button>

        <p className="text-sm text-gray-400 mt-3">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-400 cursor-pointer"
          >
            Signup
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;