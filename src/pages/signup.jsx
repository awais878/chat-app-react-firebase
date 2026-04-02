import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🔥 store user in firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        isOnline: true,
      });

      navigate("/");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSignup} className="bg-gray-800 p-8 rounded w-80">
        <h2 className="text-white text-xl mb-4">Signup</h2>

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
          Signup
        </button>

        <p className="text-sm text-gray-400 mt-3">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Signup;