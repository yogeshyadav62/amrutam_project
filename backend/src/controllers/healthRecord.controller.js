const HealthRecord = require('../models/HealthRecord.model');

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

exports.getHealthRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '15');
    const search = (req.query.search || '').trim();
    const type = req.query.type;
    const tag = req.query.tag;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { facility: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }
    if (type && type !== 'All') query.type = type;
    if (tag && tag !== 'All') query.tags = tag;

    const totalCount = await HealthRecord.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    const list = await HealthRecord.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize);

    const groupMap = new Map();
    list.forEach(record => {
      const key = record.monthYear || 'Recent Records';
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(record);
    });

    const groups = Array.from(groupMap.entries()).map(([title, data]) => ({ title, data }));
    res.json({
      success: true,
      data: {
        groups,
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

exports.createHealthRecord = async (req, res) => {
  try {
    const { title, type, doctorName, facility, summary, fileType, tags } = req.body;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const monthYear = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

    const newRecord = await HealthRecord.create({
      id: `rec_${Date.now()}`,
      title: title || `${type || 'Medical'} Record`,
      type: type || 'Prescription',
      doctorName: doctorName || 'Dr. Amrutam Specialist',
      facility: facility || 'Amrutam Health Center',
      date: dateStr,
      monthYear,
      tags: Array.isArray(tags) ? tags : ['#MedicalRecord'],
      summary: summary || 'Patient health record document.',
      fileType: fileType || 'PDF',
      fileSize: '1.2 MB',
    });

    res.status(201).json({ success: true, data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
