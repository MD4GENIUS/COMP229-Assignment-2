const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://MohamedMeghji:kMQO1zUR7AqYbRJl@cluster0.pg1z9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    category: String,
});

const Product = mongoose.model('Product', productSchema);

app.get('/', (req, res) => {
    res.send('API is working');
});

app.get('/api/products', async (req, res) => {
    console.log("GET /api/products called");
    try {
        const nameQuery = req.query.name;
        let products;
        if (nameQuery) {
            products = await Product.find({ name: { $regex: nameQuery, $options: 'i' } });
        } else {
            products = await Product.find();
        }
        res.status(200).send(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send(error);
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.status(200).send(product);
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).send(error);
    }
});

app.post('/api/products', async (req, res) => {
    const productData = req.body;

    try {
        const product = new Product(productData);
        await product.save();
        res.status(201).send(product);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).send(error);
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).send('Product not found');
        res.status(200).send(product);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(400).send(error);
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).send('Product not found');
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send(error);
    }
});

app.delete('/api/products', async (req, res) => {
    try {
        await Product.deleteMany();
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting all products:", error);
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
