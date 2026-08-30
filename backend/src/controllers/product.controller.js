const Product = require('../models/Product.model');
const Notification = require('../models/Notification.model');
const { sendFirebasePushNotification } = require('../config/firebase');

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');
    const search = (req.query.search || '').trim();
    const category = req.query.category;
    const sortBy = req.query.sortBy;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      query.category = { $regex: category, $options: 'i' };
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price-low-high') sortOptions = { price: 1 };
    else if (sortBy === 'price-high-low') sortOptions = { price: -1 };
    else if (sortBy === 'rating') sortOptions = { rating: -1 };

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    const data = await Product.find(query)
      .select('id title subtitle price originalPrice rating reviewCount size imageUrl badge category isAvailable')
      .sort(sortOptions)
      .skip(startIndex)
      .limit(pageSize);

    res.json({
      success: true,
      data: {
        data,
        page,
        pageSize,
        totalPages,
        totalCount,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, subtitle, category, price, originalPrice, size, description, ingredients, badge, stockQuantity } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, error: 'Title and Price are required.' });
    }

    const newProduct = await Product.create({
      id: `prod_${Date.now()}`,
      title,
      subtitle: subtitle || 'Authentic Ayurvedic formulation',
      category: category || 'Hair Care',
      size: size || '200ml / 200g',
      price: Number(price),
      originalPrice: Number(originalPrice || Number(price) + 150),
      rating: 5.0,
      reviewCount: 1,
      badge: badge || 'NEW',
      inStock: true,
      stockQuantity: Number(stockQuantity || 100),
      description: description || `${title} pure Ayurvedic formulation.`,
      ingredients: Array.isArray(ingredients) ? ingredients : ['Organic Ayurvedic Herbs'],
    });

    const notifTitle = 'Naya Ayurvedic Store Product 🛒';
    const notifMessage = `Authentic formulation '${newProduct.title}' (₹${newProduct.price}) ab store par launch ho gaya hai!`;

    const now = new Date();
    await Notification.create({
      id: `notif_${Date.now()}`,
      title: notifTitle,
      message: notifMessage,
      category: 'Promotional Offer',
      targetAudience: 'All Users',
      sentBy: 'System Auto-Trigger',
      status: 'Sent',
      sentAt: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('products_updated', { action: 'create', product: newProduct });
      io.emit('push_notification', { title: notifTitle, message: notifMessage });
    }
    await sendFirebasePushNotification({ title: notifTitle, body: notifMessage, topic: 'all_users' });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('products_updated', { action: 'update', product });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('products_updated', { action: 'delete', id: req.params.id });
    }

    res.json({ success: true, message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
