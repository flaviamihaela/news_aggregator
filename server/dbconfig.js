import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL

export const connectToDB = () => {
  mongoose
    .connect(mongoUrl, {
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Failed to connect to MongoDB", error);
    });
};
