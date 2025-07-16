import Article from "../models/Article.mjs";
import { addNewRssKafka } from "../services/articleService.js";
import { getRssFeedsFromMDB } from "../services/articleService.js";
import { unsubscribeFromFeed } from "../services/articleService.js";
import { markArticleAsRead } from "../services/articleService.js";
import { markArticleAsUnread } from "../services/articleService.js";

export const getArticlesByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const found = await Article.find({ category: category }).exec();

    return res.status(200).json(found);

  } catch (err) {
    console.error("Error retrieving articles:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getCategoryNames = async (req, res) => {
  try {
    const categories = await Article.distinct("category");
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error retrieving category names:", err);
    res.status(500).json({error : "Internal server error."});
  }
};

export const getAllArticles = async (req, res) => {

  try {
    // Default page start
    const page = parseInt(req.query.page) || 1;
    // Default page limit
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const articles = await Article.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await Article.countDocuments();

    return res.status(200).json({
      articles,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching articles:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getRssFeeds = async (req, res) => {
  try {
    // Call function to get RSS feeds from Kafka
    const rssFeeds = await getRssFeedsFromMDB();
    // Send them to the client as the response
    return res.status(200).json(rssFeeds);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const postNewRssFeed = async (req, res) => {
  try {
    const { rssUrl } = req.body;
    // RSS feed added to Kafka queue
    const addresult = await addNewRssKafka(rssUrl);

    if (addresult.status === "exists") {
      return res.status(409).json({ message: "Feed already registered."});
    }

    return res.status(200).json(rssUrl);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteFeed = async (req, res) => {
  try {
    const { url } = req.query;
    // Unsubscribe from RSS feed
    await unsubscribeFromFeed(url);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const patchReadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;

    console.log("PATCH /articles/:id/read called", req.body);

    const isReadDate = typeof read === "string" && !isNaN(Date.parse(read));

      if (isReadDate) {
        await markArticleAsRead({ articleId: id, date: new Date(read) });
      } else {
        await markArticleAsUnread({ articleId: id });
      }

    return res.status(200).json({ id, read });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export async function patchStarStatus(req, res) {
  try {
    const { id } = req.params;
    const { starred } = req.body;

    console.log("PATCH /articles/:id/star called", req.body);

    if (typeof starred !== "boolean") {
      return res.status(400).json({ error: "Missing or invalid starred field"});
    }
    const post = await Article.findByIdAndUpdate( id,
      { $set: { content: starred } },
      { new: true }
    );

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getArticlesStarred = async (req, res) => {
  try {
    const starred = await Article.find({ content: true }).exec();
    return res.status(200).json(starred);
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error." });
  }
};

export const getArticlesReadStatus = async (req, res) => {
  try {
    const { readStatus } = req.params;
    let filter;

    if (readStatus === "false") {
      filter = { read: "false" };
    } else if (readStatus === "true") {
      filter = { read: { $exists: true, $ne: "false" } };
    } else {
      return res.status(400).json({ error: "readStatus must be true or false" });
    }
    const articles = await Article.find(filter).exec();
    return res.status(200).json(articles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: "Internal server error."});
  }
};

export const getStats = async (req, res) => {
  try {
    const { range } = req.params;
    const now = new Date();

    const RANGES = {
      month:  () => new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      "6months":  () => new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      year: () => new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    };

    const startDate = RANGES[range]();
    const stats = await Article.aggregate([
      {
        // Keep only docs with valid date string >= startDate
        $match: {
          read: { $exists: true, $ne: "false", $gte: startDate.toISOString() },
        },
      },
      // clean the date string
      { $addFields: { day: { $substrBytes: ["$read", 0, 10] } } },
      // group by day and count
      { $group: { _id: "$day", count: { $sum: 1 } } },
      // sort ascending by date
      { $sort: { _id: 1 } },
      // rename _id -> day for the client
      { $project: { _id: 0, day: "$_id", count: 1 } },
    ]);

    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({error:"Internal server error."});
  }
};