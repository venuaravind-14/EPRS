const PerformanceReport = require('../models/PerformanceReport');
const User = require('../models/User');

exports.generateReport = async (req, res) => {
  const { employeeId, period, overallScore, summary, strengths, improvements } = req.body;
  
  try {
    const report = new PerformanceReport({
      employeeId,
      managerId: req.user.id,
      period,
      overallScore,
      summary,
      strengths,
      improvements,
      status: 'finalized'
    });

    await report.save();
    res.status(201).json({ message: 'Report generated successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

exports.getEmployeeReports = async (req, res) => {
  try {
    const reports = await PerformanceReport.find({ employeeId: req.params.employeeId })
      .populate('managerId', 'username');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};
