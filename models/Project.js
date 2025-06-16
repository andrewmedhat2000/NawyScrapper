const mongoose = require('mongoose');

const propertyTypeSchema = new mongoose.Schema({
    property_type_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    property_types_count: {
        type: Number,
        default: 0
    },
    finishing: {
        type: Map,
        of: Number,
        default: new Map()
    },
    last_update: {
        type: Date,
        default: null
    },
    min_delivery_date: {
        type: Date,
        default: null
    },
    max_delivery_date: {
        type: Date,
        default: null
    },
    financing_eligibility: {
        type: Boolean,
        default: null
    },
    min_installments: {
        type: Number,
        default: 0
    },
    max_installments: {
        type: Number,
        default: 0
    },
    min_down_payment: {
        type: Number,
        default: 0
    },
    max_down_payment: {
        type: Number,
        default: 0
    },
    min_price: {
        type: Number,
        default: null
    },
    max_price: {
        type: Number,
        default: null
    },
    min_area: {
        type: Number,
        default: null
    },
    max_area: {
        type: Number,
        default: null
    },
    min_land_area: {
        type: Number,
        default: null
    },
    max_land_area: {
        type: Number,
        default: null
    },
    min_garden_area: {
        type: Number,
        default: null
    },
    max_garden_area: {
        type: Number,
        default: null
    },
    min_bedrooms: {
        type: Number,
        default: null
    },
    max_bedrooms: {
        type: Number,
        default: null
    },
    min_bathrooms: {
        type: Number,
        default: null
    },
    max_bathrooms: {
        type: Number,
        default: null
    },
    business_types: {
        type: Map,
        of: Number,
        default: new Map()
    }
}, { _id: false });

const projectSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        default: 0
    },
    name: {
        type: String,
        default: null
    },
    area_id: {
        type: Number,
        default: null
    },
    developer_id: {
        type: Number,
        default: null
    },
    inventory_public: {
        type: Boolean,
        default: true
    },
    on_hold: {
        type: Boolean,
        default: false
    },
    last_update: {
        type: Date,
        default: null
    },
    min_delivery_date: {
        type: Date,
        default: null
    },
    max_delivery_date: {
        type: Date,
        default: null
    },
    financing_eligibility: {
        type: Boolean,
        default: null
    },
    min_installments: {
        type: Number,
        default: null
    },
    max_installments: {
        type: Number,
        default: null
    },
    min_down_payment: {
        type: Number,
        default: null
    },
    max_down_payment: {
        type: Number,
        default: null
    },
    min_price: {
        type: Number,
        default: null
    },
    max_price: {
        type: Number,
        default: null
    },
    min_area: {
        type: Number,
        default: null
    },
    max_area: {
        type: Number,
        default: null
    },
    min_land_area: {
        type: Number,
        default: null
    },
    max_land_area: {
        type: Number,
        default: null
    },
    min_garden_area: {
        type: Number,
        default: null
    },
    max_garden_area: {
        type: Number,
        default: null
    },
    min_bedrooms: {
        type: Number,
        default: null
    },
    max_bedrooms: {
        type: Number,
        default: null
    },
    min_bathrooms: {
        type: Number,
        default: null
    },
    max_bathrooms: {
        type: Number,
        default: null
    },
    business_type: {
        type: String,
        default: null
    },
    property_types_names: {
        type: Map,
        of: Number,
        default: new Map()
    },
    business_types: {
        type: Map,
        of: Number,
        default: new Map()
    },
    finishing: {
        type: Map,
        of: Number,
        default: new Map()
    },
    developer_name: {
        type: String,
        default: null
    },
    area_name: {
        type: String,
        default: null
    },
    bruchure: {
        type: [String],
        default: []
    },
    property_types: {
        type: [propertyTypeSchema],
        default: []
    }
}, {
    collection: 'nawy_projects',
    strict: false
});

// Add a static method to get the next id
projectSchema.statics.getNextId = async function() {
    const lastProject = await this.findOne().sort({ id: -1 });
    return lastProject ? lastProject.id + 1 : 1;
};

// Add pre-save middleware to set the id
projectSchema.pre('save', async function(next) {
    if (this.isNew) {
        this.id = await this.constructor.getNextId();
    }
    next();
});

// Add pre-insertMany middleware to handle bulk inserts
projectSchema.pre('insertMany', async function(next, docs) {
    try {
        const lastProject = await this.findOne().sort({ id: -1 });
        let nextId = lastProject ? lastProject.id + 1 : 1;
        
        for (const doc of docs) {
            doc.id = nextId++;
        }
    } catch (error) {
        return next(error);
    }
    next();
});

module.exports = mongoose.model('Project', projectSchema); 