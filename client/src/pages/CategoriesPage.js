import Post from "../Post";
import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config.js";

export default function CategoriesPage() {
  const { category } = useParams();
  const [posts,setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/articles/categories/${category}`).then(res => {
      res.json().then(posts => {
        setPosts(posts);
      });
    });
  }, [category]);
  
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
    </>
  );
}