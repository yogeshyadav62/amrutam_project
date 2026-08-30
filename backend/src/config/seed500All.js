const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Doctor = require('../models/Doctor.model');
const Product = require('../models/Product.model');
const HealthRecord = require('../models/HealthRecord.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/amrutam_db';

// First names, last names, cities & hospitals for generating 500 Doctors
const firstNames = [
  'Rajesh', 'Ananya', 'Vikram', 'Meera', 'Arvind', 'Priya', 'Suresh', 'Kavita', 'Harish', 'Deepa',
  'Sunil', 'Sunita', 'Amit', 'Pooja', 'Rohan', 'Sneha', 'Manoj', 'Ritu', 'Nitin', 'Shweta',
  'Ganesh', 'Lakshmi', 'Ramesh', 'Aarti', 'Alok', 'Divya', 'Sanjay', 'Neha', 'Vijay', 'Swati',
  'Ashok', 'Bhavna', 'Dinesh', 'Geeta', 'Kiran', 'Madhavi', 'Narendra', 'Padma', 'Rahul', 'Seema',
  'Tushar', 'Uma', 'Varun', 'Vandana', 'Yash', 'Anita', 'Bharat', 'Chitra', 'Devendra', 'Indira'
];

const lastNames = [
  'Sharma', 'Iyer', 'Varma', 'Deshmukh', 'Nambiar', 'Nair', 'Joshi', 'Reddy', 'Chandra', 'Swaminathan',
  'Gupta', 'Patel', 'Rao', 'Kulkarni', 'Bhat', 'Pillai', 'Menon', 'Mehta', 'Agarwal', 'Singh',
  'Verma', 'Choudhury', 'Sen', 'Banerjee', 'Ghosh', 'Das', 'Dutta', 'Roy', 'Tripathi', 'Pandey',
  'Mishra', 'Tiwari', 'Shukla', 'Dubey', 'Saxena', 'Srivastava', 'Mathur', 'Kapoor', 'Khanna', 'Malhotra'
];

const specialties = [
  'Kaya Chikitsa (General Medicine)',
  'Panchakarma & Detox Therapy',
  'Shalya Tantra (Surgical Ayurveda)',
  'Prasuti Tantra & Gynecology',
  'Kaumarbhritya (Pediatrics)',
  'Shalakya Tantra (ENT & Eye)',
  'Agada Tantra (Toxicology)',
  'Rasayana & Anti-Aging',
  'Nadi Pariksha Specialist',
  'Ayurvedic Dermatology & Skin',
  'Gastroenterology & Gut Health',
  'Neurology & Brain Health',
  'Rheumatology & Joint Care',
  'Cardiology & Heart Care',
  'Endocrinology & Diabetes'
];

const degrees = [
  'BAMS, MD (Ayurveda)',
  'BAMS, Ph.D. (Kaya Chikitsa)',
  'BAMS, MS (Shalya Tantra)',
  'BAMS, Gold Medalist (Panchakarma)',
  'BAMS, Ph.D. (Prasuti Tantra)',
  'BAMS, Fellowship in Nadi Pariksha',
  'BAMS, MD (Rasayana & Vajikarana)',
  'BAMS, MD (Kaumarbhritya)'
];

const hospitals = [
  'Amrutam Ayurvedic Wellness Center, Gwalior',
  'Patanjali Chikitsalaya, Haridwar',
  'Kottakkal Arya Vaidya Sala, Kerala',
  'Siddhagiri Ayurvedic Hospital, Kolhapur',
  'Somatheeram Ayurvedic Resort, Kovalam',
  'National Institute of Ayurveda, Jaipur',
  'All India Institute of Ayurveda, New Delhi',
  'AVP Ayurvedic Hospital, Coimbatore',
  'Soukya International Holistic Health Centre, Bengaluru',
  'Amrutam Heritage Vaidya Shala, Rishikesh'
];

const doctorImages = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813566-78a9c464b73b?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&auto=format&fit=crop&q=80'
];

// Product Data Generators
const productCategories = [
  'Hair Care', 'Skin Care', 'Hair Oils', 'Immunity Boosters',
  'Digestion & Gut Health', 'Pain Relief & Oils', 'Stress & Sleep',
  'Women Health', 'Men Wellness', 'Heart & BP', 'Diabetes Care',
  'Joint Care', 'Respiratory & Cold', 'Detox & Churna', 'Herbal Teas & Kwath'
];

const productPrefixes = [
  'Amrutam Kuntal Care', 'Amrutam Bhringraj', 'Amrutam Triphala',
  'Amrutam Nari Soundarya', 'Amrutam Brahmi', 'Amrutam Ashwagandha',
  'Amrutam Ortho Key', 'Amrutam Chyawanprash', 'Amrutam Shatavari',
  'Amrutam Mahabhringraj', 'Amrutam Neem & Tulsi', 'Amrutam Aloe Vera',
  'Amrutam Kumkumadi', 'Amrutam Jatyadi', 'Amrutam Dhanwantharam',
  'Amrutam Mahanarayana', 'Amrutam Pain Balm', 'Amrutam Herbal Malt'
];

const productTypes = [
  'Hair Spa Oil', 'Herbal Shampoo', 'Restorative Malt', 'Churna Powder',
  'Face Serum', 'Skin Gel', 'Massage Oil', 'Syrup Formula', 'Kwath Infusion',
  'Eye Drops', 'Skin Cleanser', 'Body Lotion', 'Hair Vitalizer', 'Immunity Elixir'
];

const productBadges = ['BESTSELLER', '100% ORGANIC', 'FEATURED', 'DOCTOR RECOMMENDED', 'NEW LAUNCH', 'AYURVEDIC FORMULA'];

const productImages = [
  'https://images.unsplash.com/photo-1608248597262-838d4150b074?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608248597249-14a58eb70df6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80'
];

// Health Record Data Generators
const recordTypes = ['Lab Report', 'Prescription', 'Consultation', 'Vaccination', 'Allergy'];
const recordFacilities = [
  'Amrutam Central Diagnostics, Gwalior',
  'Dr. Lal PathLabs, Delhi',
  'Apollo Diagnostics, Mumbai',
  'Metropolis Healthcare, Bengaluru',
  'SRL Diagnostics, Hyderabad',
  'Max Healthcare, New Delhi',
  'Manipal Hospital Laboratories, Jaipur'
];

async function seed500Database() {
  try {
    console.log('⚡ Connecting to MongoDB Atlas for 500-Item Seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB!');

    // 1. Seed 500 Doctors
    console.log('⏳ Generating 500 Doctors...');
    await Doctor.deleteMany({});
    const doctors = [];

    for (let i = 1; i <= 500; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const name = `Dr. ${fn} ${ln}`;
      const specialty = specialties[i % specialties.length];
      const degree = degrees[i % degrees.length];
      const hospital = hospitals[i % hospitals.length];
      const imageUrl = doctorImages[i % doctorImages.length];
      const fee = 299 + (i % 15) * 50; // ₹299 to ₹999
      const exp = 4 + (i % 22); // 4 to 25 years
      const rating = parseFloat((4.5 + (i % 6) * 0.1).toFixed(1)); // 4.5 to 5.0

      doctors.push({
        id: `doc_${i}`,
        name,
        email: `doctor${i}@amrutam.co.in`,
        password: 'Doctor@123',
        role: 'doctor',
        degree,
        specialty,
        experienceYears: exp,
        rating,
        reviewCount: 35 + (i % 250),
        consultationFee: fee,
        availableToday: true,
        nextAvailableSlot: 'Available Today',
        availableSlots: ['09:00 AM', '10:30 AM', '11:45 AM', '02:15 PM', '04:00 PM', '06:30 PM'],
        bio: `Senior ${specialty} specialist with over ${exp} years of clinical expertise at ${hospital}. Specialized in holistic root-cause healing.`,
        hospital,
        languages: ['English', 'Hindi', (i % 2 === 0 ? 'Sanskrit' : 'Gujarati')],
        imageUrl,
      });
    }

    const insertedDoctors = await Doctor.insertMany(doctors);
    console.log(`🎉 SUCCESS! Seeded ${insertedDoctors.length} Doctors in MongoDB!`);

    // 2. Seed 500 Products
    console.log('⏳ Generating 500 Products...');
    await Product.deleteMany({});
    const products = [];

    for (let i = 1; i <= 500; i++) {
      const prefix = productPrefixes[i % productPrefixes.length];
      const type = productTypes[i % productTypes.length];
      const category = productCategories[i % productCategories.length];
      const title = `${prefix} ${type} #${i}`;
      const badge = productBadges[i % productBadges.length];
      const basePrice = 249 + (i % 40) * 45; // ₹249 to ₹1999
      const originalPrice = basePrice + 150 + (i % 10) * 30;
      const imageUrl = productImages[i % productImages.length];

      products.push({
        id: `prod_${i}`,
        title,
        subtitle: `100% Authentic Ayurvedic Formula for ${category}`,
        category,
        size: i % 2 === 0 ? '200ml' : i % 3 === 0 ? '500g Malt' : '100 Capsules',
        price: basePrice,
        originalPrice,
        rating: parseFloat((4.6 + (i % 5) * 0.1).toFixed(1)),
        reviewCount: 40 + (i % 380),
        badge,
        inStock: true,
        stockQuantity: 150 + (i % 300),
        description: `Authentic Ayurvedic formulation crafted with pure botanical extracts to support ${category.toLowerCase()} and natural wellness.`,
        ingredients: ['Bhringraj', 'Amla', 'Brahmi', 'Ashwagandha', 'Shatavari', 'Guduchi', 'Tulsi'],
        imageUrl,
      });
    }

    const insertedProducts = await Product.insertMany(products);
    console.log(`🎉 SUCCESS! Seeded ${insertedProducts.length} Products in MongoDB!`);

    // 3. Seed 500 Health Records
    console.log('⏳ Generating 500 Health Records...');
    await HealthRecord.deleteMany({});
    const healthRecords = [];

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const years = ['2026', '2025', '2024'];

    for (let i = 1; i <= 500; i++) {
      const type = recordTypes[i % recordTypes.length];
      const doctor = doctors[i % doctors.length];
      const facility = recordFacilities[i % recordFacilities.length];
      const month = months[i % months.length];
      const year = years[i % years.length];
      const day = 1 + (i % 28);
      const date = `${month} ${day < 10 ? '0' + day : day}`, ${year}`;
      const monthYear = `${month} ${year}`;

      healthRecords.push({
        id: `rec_${i}`,
        title: `${type} - ${doctor.specialty.split(' ')[0]} Care #${i}`,
        type,
        doctorName: doctor.name,
        facility,
        date,
        monthYear,
        tags: [type, doctor.specialty.split(' ')[0], 'Verified Record', 'Digital Vault'],
        summary: `Detailed ${type.toLowerCase()} issued by ${doctor.name} at ${facility}. Complete vital diagnostics and recommendations attached.`,
        fileType: i % 3 === 0 ? 'PDF' : 'JPEG',
        fileSize: `${(0.8 + (i % 15) * 0.2).toFixed(1)} MB`,
      });
    }

    const insertedRecords = await HealthRecord.insertMany(healthRecords);
    console.log(`🎉 SUCCESS! Seeded ${insertedRecords.length} Health Records in MongoDB!`);

    console.log('\n========================================');
    console.log(`🚀 500 DOCTORS, 500 PRODUCTS & 500 HEALTH RECORDS SEEDED SUCCESSFULLY!`);
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Error during 500-item database seeding:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed500Database();
