const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(bodyParser.json());

// Placeholder for eBMS URL and credentials
const EBMS_API_URL = 'https://ebms.api/endpoint';
const EBMS_API_KEY = 'YOUR_EBMS_API_KEY';

// Function to stream sales and inventory updates
const streamSalesAndInventory = async (data) => {
    try {
        const response = await axios.post(`${EBMS_API_URL}/stream`, data, {
            headers: {
                'Authorization': `Bearer ${EBMS_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error streaming to eBMS:', error);
        throw error;
    }
};

// Function to generate invoice receipt with signature
const generateInvoiceReceipt = async (invoiceData) => {
    try {
        const response = await axios.post(`${EBMS_API_URL}/generateInvoice`, invoiceData, {
            headers: {
                'Authorization': `Bearer ${EBMS_API_KEY}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error generating invoice receipt:', error);
        throw error;
    }
};

// Endpoint to receive confirmed sales and inventory updates from SalesPlay POS
app.post('/sales-update', async (req, res) => {
    const salesData = req.body;

    try {
        // Stream sales and inventory updates to eBMS
        const streamResponse = await streamSalesAndInventory(salesData);

        // Generate invoice receipt with signature
        const invoiceData = {
            salesId: streamResponse.salesId,
            items: salesData.items,
            total: salesData.total
        };
        const invoiceReceipt = await generateInvoiceReceipt(invoiceData);

        res.status(200).json({ message: 'Sales and inventory updated successfully', invoiceReceipt });
    } catch (error) {
        res.status(500).json({ message: 'Error updating sales and inventory', error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});