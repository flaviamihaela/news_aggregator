import express from 'express';
import { getArticlesByCategory, getCategoryNames, getAllPosts } from '../controllers/articleController.js';

const router = express.Router();

router.get('/category/:category', getArticlesByCategory);
router.get('/categorynames', getCategoryNames);
router.get('/post', getAllPosts);

export default router;
