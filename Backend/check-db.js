const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/anneCreations');
    const db = mongoose.connection.db;

    const deals = await db.collection('products').countDocuments({ todayDeal: true });
    console.log('Today Deals count:', deals);

    const days45 = new Date();
    days45.setDate(days45.getDate() - 45);
    const newProds45 = await db.collection('products').countDocuments({ createdAt: { $gte: days45 } });
    console.log('New Arrivals count (45 days):', newProds45);

    const days300 = new Date();
    days300.setDate(days300.getDate() - 300);
    const newProds300 = await db.collection('products').countDocuments({ createdAt: { $gte: days300 } });
    console.log('New Arrivals count (300 days):', newProds300);

    const allProds = await db.collection('products').countDocuments({});
    console.log('All Products:', allProds);

    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
