require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const Project = require('./models/Project');

// Debug: Check if environment variables are loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Real Estate API is running',
        endpoints: {
            allProjects: 'GET /api/projects',
            search: 'GET /api/projects/search?name=projectName',
            getByExactName: 'GET /api/projects/:name'
        }
    });
});

// Get all projects (to see what's in the database)
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find({}).limit(20);
        
        res.json({
            success: true,
            count: projects.length,
            data: projects.map(p => ({
                name: p.name,
                developer_name: p.developer_name,
                area_name: p.area_name,
                min_price: p.min_price,
                max_price: p.max_price
            }))
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Search projects by name (partial match)
app.get('/api/projects/search', async (req, res) => {
    try {
        const { name } = req.query;
        
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Project name is required. Use ?name=projectName'
            });
        }

        // Search for projects with case-insensitive name matching
        const projects = await Project.find({
            name: { $regex: name, $options: 'i' }
        }).limit(10);

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No projects found with the given name'
            });
        }

        res.json({
            success: true,
            count: projects.length,
            data: projects
        });

    } catch (error) {
        console.error('Error searching projects:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get a specific project by exact name
app.get('/api/projects/:name', async (req, res) => {
    try {
        const { name } = req.params;
        
        const project = await Project.findOne({
            name: { $regex: `^${name}$`, $options: 'i' }
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.json({
            success: true,
            data: project
        });

    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});