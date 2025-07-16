import Post from "../Post";
import {useEffect, useState} from "react";
import { API_BASE } from "../config.js";

export default function IndexPage() {
  const [posts,setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${API_BASE}/articles?page=${page}&limit=10`).then(response => {
      response.json().then(posts => {
        setPosts(posts.articles);
        setTotalPages(posts.totalPages);
      });
    }).catch(console.error);;
  }, [page]);

  return (
    <>
      {posts.length > 0 && posts.map(post => (
        <Post     
          key={post._id}
          _id={post._id}
          title={post.title}
          link={post.link}
          author={post.author}
          date={post.date}
          starred={post.content}
          read={post.read} />
      ))}

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
            Prev
          </button>

          <span className="pagination-info">
            {page} of {totalPages}
          </span>

          <button  
            className="pagination-btn"
            onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </>
  );
}