const mongoose = require('mongoose');

const performanceReportSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  period: {
    type: String, // e.g., "Q1 2024"
    required: true
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  summary: {
    type: String
  },
  strengths: [String],
  improvements: [String],
  status: {
    type: String,
    enum: ['draft', 'finalized'],
    default: 'draft'
  }
}, { timestamps: true });

module.exports = mongoose.model('PerformanceReport', performanceReportSchema);
