import {Link, Route} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const {setUserInfo,userInfo} = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    fetch('http://localhost:3000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  useEffect(() =>{
     fetch('http://localhost:3000/categorynames', {
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            setCategories(data);
        });
  }, []);

  function logout() {
    fetch('http://localhost:3000/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
    window.location.href = '/';
  }
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">Flash.</Link>
      <nav>
        {username && (
          <>
            <div className="dropdown">
              <button className={`dropdown-toggle ${isOpen ? 'opened' : ''}`} onClick={handleToggle}>
                Choose your category
              </button>
              {isOpen && categories.length > 0 && (
                <ul className="dropdown-menu">
                  {categories.map(category => (
                     <li key={category}>
                       <Link onClick={() => {window.location.href=`/categories/${category}`}}>
                         {category}
                       </Link>
                     </li>
                  ))}
                </ul>
              )}
            </div>
            <a className="logout-button" onClick={logout}>Logout ({username})</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}