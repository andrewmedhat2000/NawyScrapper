const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/db');

const up = async function() {
    try {
        await connectDB();
        
        // Create the projects collection with schema validation
        await mongoose.connection.db.createCollection('projects', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["name", "location", "price", "area", "bedrooms", "bathrooms"],
                    properties: {
                        name: {
                            bsonType: "string",
                            description: "must be a string and is required"
                        },
                        location: {
                            bsonType: "string",
                            description: "must be a string and is required"
                        },
                        price: {
                            bsonType: "number",
                            description: "must be a number and is required"
                        },
                        area: {
                            bsonType: "number",
                            description: "must be a number and is required"
                        },
                        bedrooms: {
                            bsonType: "number",
                            description: "must be a number and is required"
                        },
                        bathrooms: {
                            bsonType: "number",
                            description: "must be a number and is required"
                        },
                        description: {
                            bsonType: "string",
                            description: "must be a string if the field exists"
                        },
                        amenities: {
                            bsonType: "array",
                            items: {
                                bsonType: "string"
                            },
                            description: "must be an array of strings if the field exists"
                        },
                        images: {
                            bsonType: "array",
                            items: {
                                bsonType: "string"
                            },
                            description: "must be an array of strings if the field exists"
                        },
                        createdAt: {
                            bsonType: "date",
                            description: "must be a date if the field exists"
                        }
                    }
                }
            }
        });

        // Create indexes
        await mongoose.connection.db.collection('projects').createIndex({ name: 1 });
        await mongoose.connection.db.collection('projects').createIndex({ location: 1 });
        await mongoose.connection.db.collection('projects').createIndex({ price: 1 });
        await mongoose.connection.db.collection('projects').createIndex({ createdAt: 1 });

        console.log('Projects collection created successfully');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

const down = async function() {
    try {
        await connectDB();
        await mongoose.connection.db.collection('projects').drop();
        console.log('Projects collection dropped successfully');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Migration rollback failed:', error);
        process.exit(1);
    }
};

module.exports = { up, down }; 