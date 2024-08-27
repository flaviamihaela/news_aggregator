import express from 'express';
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import { schedulePuppeteerTask } from './controllers/puppeteerController.js';
import { cronSchedule } from './services/puppeteerService.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: 'http://localhost:3001' }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

// Schedule Puppeteer Task
schedulePuppeteerTask(cronSchedule);

export default app;
