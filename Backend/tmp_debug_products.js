
const mongoose = require('mongoose');

async function debugProducts() {
    await mongoose.connect('mongodb://127.0.0.1:27017/anneCreations');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');

    const p1 = await Product.findOne({ productModel: 'BHPALLU149' });
    const p2 = await Product.findOne({ productModel: 'BHPALLU147' });

    console.log('--- BHPALLU149 ---');
    console.log(JSON.stringify(p1, null, 2));
    console.log('--- BHPALLU147 ---');
    console.log(JSON.stringify(p2, null, 2));

    await mongoose.disconnect();
}

debugProducts();
