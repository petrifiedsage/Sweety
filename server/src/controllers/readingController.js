const readingService = require('../services/readingService');

async function createReading(req, res, next) {
  try {
    const reading = await readingService.createReading(req.user.id, req.body);
    return res.status(201).json({
      message: 'Reading recorded successfully.',
      reading,
    });
  } catch (err) {
    return next(err);
  }
}

async function getReadings(req, res, next) {
  try {
    const result = await readingService.listReadings(req.user.id, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

async function getReadingById(req, res, next) {
  try {
    const reading = await readingService.getReadingById(req.user.id, req.params.id);
    return res.status(200).json({ reading });
  } catch (err) {
    return next(err);
  }
}

async function updateReading(req, res, next) {
  try {
    const reading = await readingService.updateReading(
      req.user.id,
      req.params.id,
      req.body
    );
    return res.status(200).json({
      message: 'Reading updated successfully.',
      reading,
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteReading(req, res, next) {
  try {
    await readingService.deleteReading(req.user.id, req.params.id);
    return res.status(200).json({
      message: 'Reading deleted successfully.',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
