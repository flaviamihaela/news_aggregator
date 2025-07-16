import { useState, useEffect } from "react";
import { API_BASE } from "../config.js";

export default function RSSFeedInput() {
  const [rssUrl, setRssUrl] = useState("");
  const [feeds,  setFeeds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res  = await fetch(`${API_BASE}/articles/rss`);
      setFeeds(await res.json());
    })();
  }, []);

  const delay = ms => new Promise(r => setTimeout(r, ms));

  async function handleSubmit(ev) {
    ev.preventDefault();
    setIsLoading(true);

    try {
      await fetch(`${API_BASE}/articles/rss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rssUrl }),
      });
      setRssUrl("");

      await delay(5000);
      window.location.reload();
    } catch (err) {
      console.error("Add failed:", err);
      setIsLoading(false);
    }
  }

  async function handleDelete(url) {
    setIsLoading(true);

    try {
      const del = `${API_BASE}/articles/rss?url=${encodeURIComponent(url)}`;
      await fetch(del, { method: "DELETE" });

      await delay(5000);
      window.location.reload();
    } catch (err) {
      console.error("Delete failed:", err);
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(2px)"
          }}
        >
          <div style={{ color: "#fff", fontSize: "1.5rem" }}>loading.</div>
        </div>
      )}

      <form className="rss" onSubmit={handleSubmit}>
        <h1>Enter RSS feed URL:</h1>

        <input
          type="text"
          value={rssUrl}
          onChange={e => setRssUrl(e.target.value)}
          placeholder="https://example.com/rss"
          required
        />
        <button type="submit">fetch.</button>

        <ul className="feeds-container">
          {feeds.map(url => (
            <li key={url} className="feed-box">
              <button
                type="button"
                className="xbutton"
                onClick={() => handleDelete(url)}
                aria-label="delete"
              >
                ×
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </li>
          ))}
        </ul>
      </form>
    </>
  );
}
