import {useState} from "react";
import { API_BASE } from "../config.js";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function register(ev) {
    ev.preventDefault();

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify({username,password}),
      headers: {"Content-Type":"application/json"},
    });
    
    if (response.status === 200) {
      alert("Registration successful.");
      window.location.href = "/login";
    } else {
      alert("Registration failed.");
    }
  }
  
  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input type="text"
             placeholder="username"
             value={username}
             onChange={ev => setUsername(ev.target.value)}/>
      <input type="password"
             placeholder="password"
             value={password}
             onChange={ev => setPassword(ev.target.value)}/>
      <button>Register</button>
    </form>
  );
}