import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    feed: {
      title: { type: String, required: true },
      url:   { type: String, required: true },
    },

    title:   { type: String, required: true },
    id:      { type: String, required: true, unique: true },
    link:    { type: String, required: true },
    content: { type: String },
    author:  { type: String },
    date:    { type: Date,   required: true },
    read:    { type: String },
  },
  { timestamps: true }
);

const Article = mongoose.model("Article", ArticleSchema);

export default Article;