import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    articleName: {
      type: String,
      required: true,
    },
    articleLink: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    imagesource: {
      type: String,
      required: false,
    },
    source: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", ArticleSchema);
export default Article;