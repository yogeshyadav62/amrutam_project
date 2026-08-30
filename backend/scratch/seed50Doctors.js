require('dotenv').config();
const mongoose = require('mongoose');
const Doctor = require('../src/models/Doctor.model');

const specialties = [
  'Kaya Chikitsa (General Medicine)',
  'Panchakarma Specialist',
  'Shalya Tantra (Surgery)',
  'Skin & Hair Wellness',
  'Digestive & Metabolic Disorders',
];

const degrees = [
  'BAMS, MD (Ayurveda)',
  'BAMS, MS (Shalya Tantra)',
  'BAMS, Ph.D. (Rasashastra)',
  'BAMS, Gold Medalist',
  'BAMS, MD (Panchakarma)',
  'BAMS, Fellow in Ayurvedic Cardiology',
];

const hospitals = [
  'Amrutam Central Hospital, New Delhi',
  'Amrutam Ayurvedic Wellness Center, Mumbai',
  'Dhanvantari Chikitsalaya, Bengaluru',
  'Kottakkal Arya Vaidya Sala Center, Kochi',
  'Patanjali Research Institute, Haridwar',
  'Amrutam Heritage Clinic, Jaipur',
  'Charaka Ayurvedic Institute, Varanasi',
  'Sushruta Holistic Healthcare, Pune',
];

const languagesList = [
  ['English', 'Hindi'],
  ['English', 'Hindi', 'Sanskrit'],
  ['Hindi', 'Marathi'],
  ['English', 'Malayalam'],
  ['Hindi', 'Gujarati'],
  ['English', 'Hindi', 'Bengali'],
  ['English', 'Kannada', 'Hindi'],
];

const timeSlotPresets = [
  ['08:00 AM', '09:30 AM', '11:00 AM', '02:00 PM', '04:30 PM', '06:00 PM'],
  ['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '05:00 PM', '07:30 PM'],
  ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '06:30 PM', '08:00 PM'],
  ['08:30 AM', '10:00 AM', '11:30 AM', '03:00 PM', '05:30 PM', '07:00 PM', '08:30 PM'],
  ['09:30 AM', '11:00 AM', '01:30 PM', '04:00 PM', '06:30 PM'],
];

const names = [
  'Dr. Rajesh Vaidya',
  'Dr. Ananya Sharma',
  'Dr. Vikramaditya Joshi',
  'Dr. Sunita Kulkarni',
  'Dr. Meera Deshmukh',
  'Dr. Arvind Tripathi',
  'Dr. Kavita Nair',
  'Dr. Ranganath Bhat',
  'Dr. Priya Singhania',
  'Dr. Harish Chandra',
  'Dr. Pooja Hegde',
  'Dr. Devendra Pandey',
  'Dr. Shalini Saxena',
  'Dr. Manoj Pillai',
  'Dr. Smita Agarwal',
  'Dr. Alok Verma',
  'Dr. Rashmi Iyer',
  'Dr. Pankaj Shastri',
  'Dr. Deepa Menon',
  'Dr. Suresh Gupta',
  'Dr. Vandana Rao',
  'Dr. Ashish Mukherjee',
  'Dr. Swati Sen',
  'Dr. Tarun Nambiar',
  'Dr. Bhuvaneshwar Das',
  'Dr. Niharika Kapoor',
  'Dr. Sanjeev Shrivastav',
  'Dr. Yamini Chawla',
  'Dr. Girish Mahajan',
  'Dr. Reena Mehta',
  'Dr. Vijay Anand',
  'Dr. Aparna Reddy',
  'Dr. Rakesh Tiwari',
  'Dr. Charu Lata',
  'Dr. Nitin Kulkarni',
  'Dr. Shubha Iyengar',
  'Dr. Gautam Rastogi',
  'Dr. Archana Shukla',
  'Dr. Vinay Bharadwaj',
  'Dr. Archit Dave',
  'Dr. Gayatri Mohan',
  'Dr. Pradeep Upadhyay',
  'Dr. Bhavna Joshi',
  'Dr. Sanjay Rathore',
  'Dr. Preeti Thaker',
  'Dr. Hemant Purohit',
  'Dr. Divya Namboodiri',
  'Dr. Subhash Chandra',
  'Dr. Latika Sengupta',
  'Dr. Yogesh Yadav',
];

async function seedDoctors() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    // Delete existing doctors to seed a fresh 50 doctors catalog
    await Doctor.deleteMany({});
    console.log('Cleared existing doctor collection.');

    const doctorsToCreate = names.map((name, index) => {
      const spec = specialties[index % specialties.length];
      const deg = degrees[index % degrees.length];
      const hosp = hospitals[index % hospitals.length];
      const langs = languagesList[index % languagesList.length];
      const slots = timeSlotPresets[index % timeSlotPresets.length];
      const exp = 5 + (index % 25);
      const rating = Number((4.5 + (index % 5) * 0.1).toFixed(1));
      const reviews = 45 + index * 12;
      const fee = 399 + (index % 10) * 100;

      const firstName = name.replace('Dr. ', '').split(' ')[0].toLowerCase();
      const email = `dr.${firstName}${index + 1}@amrutam.com`;

      return {
        id: `doc_${Date.now()}_${index + 1}`,
        name,
        email,
        password: 'Doctor@123',
        role: 'doctor',
        degree: deg,
        specialty: spec,
        experienceYears: exp,
        rating,
        reviewCount: reviews,
        consultationFee: fee,
        availableToday: true,
        nextAvailableSlot: 'Available Today',
        availableSlots: slots,
        bio: `${name} is an esteemed Senior Vaidya specializing in ${spec} with over ${exp} years of clinical expertise. Having treated thousands of patients through traditional Nadi Pariksha and personalized Panchakarma therapies, ${name} focuses on root-cause healing.`,
        hospital: hosp,
        languages: langs,
      };
    });

    const inserted = await Doctor.insertMany(doctorsToCreate);
    console.log(`🎉 Successfully seeded ${inserted.length} Doctors with login credentials in MongoDB Atlas!`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
}

seedDoctors();
