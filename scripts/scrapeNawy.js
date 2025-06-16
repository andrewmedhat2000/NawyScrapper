require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Project = require('../models/Project');
const connectDB = require('../config/db');

const scrapeNawy = async () => {
    let connection;
    try {
        connection = await connectDB();
        
        const headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Content-Type': 'application/json',
            'Origin': 'https://partners.nawy.com',
            'Referer': 'https://partners.nawy.com/'
        };

        // First, get all compounds at once
        console.log('Fetching all compounds...');
        const allCompounds = [];
        let currentPage = 0;
        let hasMorePages = true;
        const pageSize = 100; // Increased page size

        while (hasMorePages) {
            const response = await axios.get('https://webapi.cooingestate.com/api/compounds/search_with_details', {
                params: {
                    page_size: pageSize,
                    page: currentPage,
                    language: 'en'
                },
                headers
            });

            if (response.data.status === 'success' && response.data.compounds?.length > 0) {
                allCompounds.push(...response.data.compounds);
                console.log(response.data.compounds.length);
                console.log(`Fetched page ${currentPage}, total compounds: ${allCompounds.length}`);
                
                if (response.data.compounds.length < pageSize) {
                    hasMorePages = false;
                } else {
                    currentPage++;
                }
            } else {
                hasMorePages = false;
            }
        }

        console.log(`\nTotal compounds found: ${allCompounds.length}`);

        // Process all property types in parallel with a higher concurrency
        const BATCH_SIZE = 20; // Increased batch size
        const allProjects = [];
        
        for (let i = 0; i < allCompounds.length; i += BATCH_SIZE) {
            const batch = allCompounds.slice(i, i + BATCH_SIZE);
            console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(allCompounds.length/BATCH_SIZE)}`);
            
            const batchPromises = batch.map(async (compound) => {
                try {
                    const [propertyTypesResponse] = await Promise.all([
                        axios.get(
                            `https://webapi.cooingestate.com/api/compounds/${compound.id}/property_types/search_with_details`,
                            {
                                params: { page_size: 30, language: 'en' },
                                headers
                            }
                        )
                    ]);

                    // Simplified Map creation
                    const createMap = (obj) => {
                        if (!obj || Object.keys(obj).length === 0) return new Map([['default', 1]]);
                        return new Map(Object.entries(obj));
                    };

                    // Process property types data with simplified mapping
                    const propertyTypesData = propertyTypesResponse.data.map(pt => ({
                        property_type_id: pt.property_type_id,
                        name: pt.name,
                        property_types_count: pt.property_types_count,
                        finishing: createMap(pt.finishing),
                        last_update: new Date(pt.last_update),
                        min_delivery_date: new Date(pt.min_delivery_date),
                        max_delivery_date: new Date(pt.max_delivery_date),
                        financing_eligibility: pt.financing_eligibility,
                        min_installments: parseFloat(pt.min_installments) || 0,
                        max_installments: parseFloat(pt.max_installments) || 0,
                        min_down_payment: parseFloat(pt.min_down_payment) || 0,
                        max_down_payment: parseFloat(pt.max_down_payment) || 0,
                        min_price: pt.min_price || null,
                        max_price: pt.max_price || null,
                        min_area: pt.min_area || null,
                        max_area: pt.max_area || null,
                        min_land_area: pt.min_land_area || null,
                        max_land_area: pt.max_land_area || null,
                        min_garden_area: pt.min_garden_area || null,
                        max_garden_area: pt.max_garden_area || null,
                        min_bedrooms: pt.min_bedrooms || null,
                        max_bedrooms: pt.max_bedrooms || null,
                        min_bathrooms: pt.min_bathrooms || null,
                        max_bathrooms: pt.max_bathrooms || null,
                        business_types: createMap(pt.business_types)
                    }));

                    // Simplified project transformation
                    return {
                        name: compound.name,
                        area_id: compound.area_id,
                        developer_id: compound.developer_id,
                        inventory_public: compound.inventory_public,
                        on_hold: compound.on_hold,
                        last_update: new Date(compound.last_update),
                        min_delivery_date: new Date(compound.min_delivery_date),
                        max_delivery_date: new Date(compound.max_delivery_date),
                        financing_eligibility: compound.financing_eligibility || false,
                        min_installments: parseFloat(compound.min_installments) || 0,
                        max_installments: parseFloat(compound.max_installments) || 0,
                        min_down_payment: parseFloat(compound.min_down_payment) || 0,
                        max_down_payment: parseFloat(compound.max_down_payment) || 0,
                        min_price: compound.min_price || 0,
                        max_price: compound.max_price || 0,
                        min_area: compound.min_area || 0,
                        max_area: compound.max_area || 0,
                        min_land_area: compound.min_land_area || 0,
                        max_land_area: compound.max_land_area || 0,
                        min_garden_area: compound.min_garden_area || 0,
                        max_garden_area: compound.max_garden_area || 0,
                        min_bedrooms: compound.min_bedrooms || 0,
                        max_bedrooms: compound.max_bedrooms || 0,
                        min_bathrooms: compound.min_bathrooms || 0,
                        max_bathrooms: compound.max_bathrooms || 0,
                        business_type: compound.business_type || 'Unknown',
                        property_types_names: createMap(compound.property_types_names),
                        business_types: createMap(compound.business_types),
                        finishing: createMap(compound.finishing),
                        developer_name: compound.developer_name || 'Unknown',
                        area_name: compound.area_name || 'Unknown',
                        bruchure: (compound.bruchure || []).filter(Boolean),
                        property_types: propertyTypesData
                    };
                } catch (error) {
                    console.error(`Error processing compound ${compound.id}:`, error.message);
                    return null;
                }
            });

            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter(Boolean);
            allProjects.push(...validResults);
            
            console.log(`Completed batch ${Math.floor(i/BATCH_SIZE) + 1}. Total projects: ${allProjects.length}`);
        }
        
        console.log(`\nTotal projects processed: ${allProjects.length}`);
        
        if (allProjects.length > 0) {
            console.log('\nSaving to database...');
            await Project.deleteMany({});
            
            try {
                const savedProjects = await Project.insertMany(allProjects, { 
                    ordered: false, 
                    rawResult: true 
                });
                console.log(`Successfully saved ${savedProjects.insertedCount} projects`);
                
                if (savedProjects.writeErrors?.length > 0) {
                    console.log('Some documents failed to save:');
                    savedProjects.writeErrors.forEach(error => {
                        console.error(`Error: ${JSON.stringify(error.err, null, 2)}`);
                    });
                }
            } catch (saveError) {
                console.error('Error saving projects:', saveError);
                if (saveError.writeErrors) {
                    saveError.writeErrors.forEach(error => {
                        console.error('Write error:', JSON.stringify(error.err, null, 2));
                    });
                }
            }
        } else {
            console.log('No projects found to save');
        }
    } catch (error) {
        console.error('Scraping failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Status:', error.response.status);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.disconnect();
            console.log('Database connection closed');
        }
    }
};

scrapeNawy();