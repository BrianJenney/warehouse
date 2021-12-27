import express from 'express';
import serverless from 'serverless-http';
import allRoutes from './src/routes';
import cors from 'cors';
import { config } from 'dotenv';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
config();

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const app = express();
const port = process.env.PORT || 5000;

app.use(cookieParser());

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    })
);

app.use(cors());
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/handlepayments') {
        next();
    } else {
        express.json({ limit: '50mb' })(req, res, next);
    }
});
app.use(allRoutes);

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log(`Running on port ${port}`));
}

export { app };
module.exports.handler = serverless(app);
