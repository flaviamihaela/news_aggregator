import Article from '../models/Article.mjs';

export const getArticlesByCategory = async (req, res) => {
  const category = req.params.category;
  try {
    const found = await Article.find({ category: category }).exec();
    res.send(found);
  } catch (err) {
    console.error('Error retrieving articles:', err);
    res.status(500).send('Internal Server Error');
  }
};

export const getCategoryNames = async (req, res) => {
  try {
    const categories = await Article.distinct('category');
    res.send(categories);
  } catch (err) {
    console.error('Error retrieving category names:', err);
    res.status(500).send('Internal Server Error');
  }
};

export const getAllPosts = async (req, res) => {
  res.json(await Article.find());
};
