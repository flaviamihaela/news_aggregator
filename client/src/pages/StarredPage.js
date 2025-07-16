import Post from "../Post";
import {useEffect, useState} from "react";
import { API_BASE } from "../config.js";

export default function StarredPage() {
  const [posts,setPosts] = useState([]);
  useEffect(() => {
    fetch(`${API_BASE}/articles/starred`).then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, []);
  return (
    <>
      {posts.map(post => (
        <Post
          key={post._id ?? post.id}
          _id={post._id ?? post.id}
          title={post.title}
          link={post.link}
          author={post.author}
          date={post.date}
          starred={post.content}
          read={post.read}/>
      ))}
    </>
  );
}