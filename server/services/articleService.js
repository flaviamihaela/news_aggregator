import axios from "axios";
import Article from "../models/Article.mjs";

const KAFKA_CONNECT_URL = process.env.KAFKA_URL; //Kafka Connect URL 

//Add a new RSS feed to Kafka Connect
export const addNewRssKafka = async (newRssUrl) => {
  try {
    const connectorTopicName = newRssUrl.replace(/[^a-zA-Z0-9_]/g, "")

    const existingConnectorsResponse = await axios.get(KAFKA_CONNECT_URL);
    const existingConnectors = existingConnectorsResponse.data;

    if (existingConnectors.includes(connectorTopicName)) {
      return { status: "exists"};
    }
    const newSourceConfig = {
      "name": connectorTopicName,
      "config": {
        "connector.class": "org.kaliy.kafka.connect.rss.RssSourceConnector",
        "tasks.max": "2",
        "rss.urls": newRssUrl,
        "topic": "RSS"
      }
    };

    const sourceResponse = await axios.post(
      KAFKA_CONNECT_URL,
      newSourceConfig,
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error in POST /articles/rss:", err);
  }
};

//Get list of existing RSS feeds
export const getRssFeedsFromMDB = async () => {
  try {
    const existingSourceUrls = await Article.distinct("feed.url");
    return existingSourceUrls;

  } catch (err) {
    console.error("Error retrieving RSS feed URLs:", err.response?.data || err.message);
  }
};

//Unsubscribe from RSS feed
export const unsubscribeFromFeed = async (rssUrl) => {
  try {
    const connectorTopicName = rssUrl.replace(/[^a-zA-Z0-9_]/g, "")
   
    await axios.put(`${KAFKA_CONNECT_URL}/${connectorTopicName}/stop`, {});
    await axios.delete(`${KAFKA_CONNECT_URL}/${connectorTopicName}/offsets`);
    await axios.delete(`${KAFKA_CONNECT_URL}/${connectorTopicName}`);

    const deleted = await Article.deleteMany({ "feed.url": rssUrl });

  } catch (err) {
    console.error("Error unsubscribing from RSS feed:", err.response?.data || err.message);
  }
};

export const markArticleAsRead = async ({ articleId, date }) => {

  const result = await Article.findByIdAndUpdate(
    articleId,
    { $set: { read: date ?? new Date() } },
    { new: true }
  );

  return result;
};

export const markArticleAsUnread = async ({ articleId }) => {

  const result = await Article.findByIdAndUpdate(
    articleId,
    { $set: { read: "false" } },
    { new: true }
  );

  return result;
};
