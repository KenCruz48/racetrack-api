const eventService = require('../services/eventService');

function getExampleEvent(req, res) {
  const event = eventService.getExampleEvent();

  res.status(200).json({
    status: 'success',
    data: event,
  });
}

module.exports = {
  getExampleEvent,
};