import Post from "../Post";
import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config.js";

export default function ReadPage() {
  const { readStatus } = useParams();
  const [posts,setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/articles/read/${readStatus}`).then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, [readStatus]);

  return (
    <>
      {posts.length === 0 ? (
        <p>No articles to show.</p> ) : 
        ( posts.map(post => (
          <Post
            key={post._id ?? post.id}
            _id={post._id ?? post.id}
            title={post.title}
            link={post.link}
            author={post.author}
            date={post.date}
            starred={post.content}
            read={post.read}/>
        )))
      }
    </>
  );
}