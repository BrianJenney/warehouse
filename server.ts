import express from 'express';
import serverless from 'serverless-http';
import allRoutes from './src/routes';
import cors from 'cors';
import { config } from 'dotenv';
import fileUpload from 'express-fileupload';
import mongoose from 'mongoose';
config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const app = express();
const port = process.env.PORT || 5000;

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    })
);

app.use(cors());
app.use(express.json());
app.use(allRoutes);

app.listen(port, () => console.log(`Running on port ${port}`));

module.exports.handler = serverless(app);
