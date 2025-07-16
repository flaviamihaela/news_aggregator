import {Link, Route} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext";
import { API_BASE } from "./config";

export default function Header() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReadOpen, setIsReadOpen] = useState(false);
  const {setUserInfo,userInfo} = useContext(UserContext);
  const [categories, setCategories] = useState([]);
  const readStatuses = ["true", "false"];
  useEffect(() => {
    fetch(`${API_BASE}/auth/profile`, {
      credentials: "include",
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  useEffect(() =>{
    fetch(`${API_BASE}/articles/categories`, {
        credentials: "include",
      })
      .then(response => response.json())
      .then(data => {
        setCategories(data);
      });
  }, []);

  function logout() {
    fetch(`${API_BASE}/auth/logout`, {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
    window.location.href = "/";
  }
  
  const handleFilterToggle = () => {
    if (isFilterOpen) {
      setIsFilterOpen(false);
    } else {
      setIsFilterOpen(true);
    }
  };

  const handleReadToggle = () => {
    if (isReadOpen) {
      setIsReadOpen(false);
    } else {
      setIsReadOpen(true);
    }
  };


  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">sip the drip.</Link>
      
      <nav>
        {username && (
          <>
            <Link to="/star" className="link-button">faves.</Link>

            <div className="dropdown">
              <button className={`dropdown-toggle ${isFilterOpen ? "opened" : ""}`} 
              onClick={handleFilterToggle}
              disabled={categories.length === 0}
              >
                filter.
              </button>
              {isFilterOpen && categories.length > 0 && (
                <ul className="dropdown-menu">
                  {categories.map(category => (
                     <li key={category}>
                        <Link Link to={`categories/${category}`} onClick={() => { setIsFilterOpen(false); }}>
                          {category}
                        </Link>
                     </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dropdown">
              <button className={`dropdown-toggle ${isReadOpen ? "opened" : ""}`} 
              onClick={handleReadToggle}
              disabled={readStatuses.length === 0}
              >
                read.
              </button>
              {isReadOpen && (
                <ul className="dropdown-menu">
                  {readStatuses.map(status => (
                     <li key={status}>
                        <Link to={`read/${status}`} onClick={() => { setIsReadOpen(false); }}>
                          {status}
                        </Link>
                     </li>
                  ))}
                </ul>
              )}
            </div>

            <Link to="/rss" className="link-button">add.</Link>

            <Link to="/stats" className="link-button">stats.</Link>

            <a className="link-button" onClick={logout}>logout ({username}).</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login" className="link-button">login</Link>
            <Link to="/register" className="link-button">register</Link>
          </>
        )}
      </nav>
    </header>
  );
}