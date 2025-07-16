import "./App.css";
import {Route, Routes} from "react-router-dom";
import Layout from "./Layout";
import IndexPage from "./pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewRssPage from "./pages/NewRssPage";
import {UserContextProvider} from "./UserContext";
import CategoriesPage from "./pages/CategoriesPage";
import ReadPage from "./pages/ReadPage";
import StarredPage from "./pages/StarredPage";
import StatsPage from "./pages/StatsPage";

function App() {
  return (
    <UserContextProvider>
      <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rss" element={<NewRssPage />} />
          <Route path="/categories/:category" element={<CategoriesPage />} />
          <Route path="/star" element={<StarredPage />} />
          <Route path="/read/:readStatus" element={<ReadPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;