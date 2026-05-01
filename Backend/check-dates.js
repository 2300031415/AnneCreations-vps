const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/anneCreations');
    const db = mongoose.connection.db;

    const newestProducts = await db.collection('products')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

    if (newestProducts.length > 0) {
        console.log('Most recent product createdAt:', newestProducts[0].createdAt);
        for (const p of newestProducts) {
            console.log(`- ${p.productModel}: ${p.createdAt}`);
        }
    } else {
        console.log('No products found in DB!');
    }
    const deals = await db.collection('products').countDocuments({ todayDeal: true });
    console.log('Today Deals count:', deals);

    const docsWithCreatedAt = await db.collection('products').countDocuments({ createdAt: { $exists: true } });
    console.log('Products that actually have a createdAt field:', docsWithCreatedAt);

    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
