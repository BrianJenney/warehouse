import { MongoMemoryServer } from 'mongodb-memory-server';
import { Collection, Db, MongoClient } from 'mongodb';
import mongoose from 'mongoose';

let mongo: MongoMemoryServer;
let mongoClient: MongoClient;
let db: Db;

/**
 * 1.
 * Initial setup step to be run ONCE BEFORE ALL test cases
 */
beforeAll(async () => {
    jest.setTimeout(5000);
    /**
     * 1.1
     * Start in-memory MongoDB
     */
    mongo = await MongoMemoryServer.create();

    /**
     * 1.2
     * Set the MongoDB host and DB name as environment variables,
     * because the application expect it as ENV vars.
     * The values are being created by the in-memory MongoDB
     */
    process.env.MONGO_URI = mongo.getUri();
    process.env.MONGO_DB = 'jest';

    /**
     * 1.3
     * Connect to our in-memory MongoDB, so we can do some initial setup/cleaning
     */
    await mongoose.connect(process.env.MONGO_URI);
});

/**
 * 3.
 * Final "cleanup" step to be run after all the test cases finished
 */
afterAll(async () => {
    /**
     * 3.1
     * Close connection to our MongoDB
     * Stop our in-memory MongoDB
     */
    await mongoose.connection.close();
});
