import app from './app.js';
import { connectToDB } from './dbconfig.js';

const port = process.env.PORT;

connectToDB();

app.listen(port, () => {
    console.log(`Express is listening at http://localhost:${port}`);
  });
