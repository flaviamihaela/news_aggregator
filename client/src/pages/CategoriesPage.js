import Post from "../Post";
import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
export default function CategoriesPage() {
  const { category } = useParams();
  console.log(category)
  const [posts,setPosts] = useState([]);
  useEffect(() => {
    fetch(`http://localhost:3000/category/${category}`).then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, []);
  return (
    <>
      {posts.length > 0 && posts.map(post => (
        <Post {...post} />
      ))}
    </>
  );
}