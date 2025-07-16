import express from "express";
import * as articleController from "../controllers/articleController.js";

const router = express.Router();

//Get category names to show in the dropdown
router.get("/categories", articleController.getCategoryNames);

//Filter articles by category
router.get("/categories/:category", articleController.getArticlesByCategory);

//Show all posts
router.get("/", articleController.getAllArticles);

//Add a new RSS feed
router.post("/rss", articleController.postNewRssFeed);

//Get names of all existing RSS feeds 
router.get("/rss", articleController.getRssFeeds);

//Unsubscribe from a feed
router.delete("/rss", articleController.deleteFeed);

//Mark as read
router.patch("/:id/read", articleController.patchReadStatus);

//Mark as starred
router.patch("/:id/star", articleController.patchStarStatus);

//Filter by read/unread
router.get("/read/:readStatus", articleController.getArticlesReadStatus)

//Filter by starred
router.get("/starred", articleController.getArticlesStarred)

//Show stats
router.get("/stats/:range", articleController.getStats)

export default router;
