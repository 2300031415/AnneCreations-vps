
const mongoose = require('mongoose');

async function fixProducts() {
    await mongoose.connect('mongodb://127.0.0.1:27017/anneCreations');
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }), 'products');

    await Product.updateOne({ productModel: 'BHPALLU149' }, {
        $set: {
            image: 'catalog/product/BHPALLU149_image.jpg',
            stitches: '1,25,000',
            dimensions: '350 x 550 mm',
            colourNeedles: '12 / 12',
            status: true
        }
    });

    await Product.updateOne({ productModel: 'BHPALLU147' }, {
        $set: {
            image: 'catalog/product/BHPALLU147_image.jpg',
            stitches: '1,10,000',
            dimensions: '320 x 500 mm',
            colourNeedles: '9 / 9',
            status: true
        }
    });

    console.log('Products updated successfully.');
    await mongoose.disconnect();
}

fixProducts();
