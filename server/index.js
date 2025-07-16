import "dotenv/config"; 
import app from "./app.js";
import { connectToDB } from "./dbconfig.js";

const port = process.env.PORT || 3000;

connectToDB(); 

app.listen(port, "0.0.0.0", () => {
  console.log(`Express is listening on port: ${port}`);
});
