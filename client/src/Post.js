import { useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';
import { API_BASE } from "./config.js";

export default function Post({ _id, title, link, author, date, starred, read }) {
  const {userInfo, setUserInfo} = useContext(UserContext);
  const [isStarred, setIsStarred] = useState(starred === 'true');
  const [isRead, setIsRead] = useState(isReadDate(read));

  function isReadDate(value) {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  }

  useEffect(() => {
    fetch(`${API_BASE}/auth/profile`, {
      credentials: "include",
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  useEffect(() => {
    setIsStarred(starred === 'true');
  }, [starred]);

  useEffect(() => {
    setIsRead(isReadDate(read));
  }, [read]);

  async function handleToggleStar() {
    try {
      await fetch(`${API_BASE}/articles/${_id}/star`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ starred: !isStarred }),
      });

      setIsStarred(!isStarred);
    } catch (err) {
      console.error('Could not update star:', err);
    }
  }

  async function handleReadMark() {
    const newReadValue = isRead ? false : new Date().toISOString();

    try {
      await fetch(`${API_BASE}/articles/${_id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ read: newReadValue }),
      });

      setIsRead(!isRead);
    } catch (err) {
      console.error('Could not update read:', err);
    }
  }

  const username = userInfo?.username;

  return (
    <div className="post">
      <div className="texts">
        <h2>
          <a
            href={link}
            className="article-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
        </h2>

        <p className="info">
          <span className="author">{author}</span>
          <time>{new Date(date).toLocaleDateString()}</time>

          {username && (
            <button
              className="star-btn"
              onClick={handleToggleStar}
              style={{ color: isStarred ? 'gold' : 'lightgray' }}
            >
              {isStarred ? '★' : '☆'}
            </button>
          )}

          {username && (
            <button
              className="read-btn"
              onClick={handleReadMark}
              style={{ color: isRead ? 'lightblue' : 'lightgray' }}
            >
              {isRead ? '⛊' : '⛉'}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
