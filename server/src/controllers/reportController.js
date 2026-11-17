const reportService = require('../services/reportService');

async function getDailyReport(req, res, next) {
  try {
    const report = await reportService.getDailyReport(req.user.id, req.query.date);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function getMonthToDateReport(req, res, next) {
  try {
    const report = await reportService.getMonthToDateReport(req.user.id, req.query.date);
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

async function getMonthlyReport(req, res, next) {
  try {
    const report = await reportService.getPreviousMonthlyReport(
      req.user.id,
      req.query.date
    );
    return res.status(200).json(report);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};
