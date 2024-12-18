const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  time: { type: String },
  createdBy: { type: String, required: true },
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
