const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    points: { type: Number, default: 0 },

    // Format: [ "question", "amountOfTimes", "category" ]
    correct_answers: { type: Array, default: [] },
    incorrect_answers: { type: Array, default: [] },

    last_question: { type: String, default: '' },
    last_question_correct: { type: Boolean, default: false },
    bgSet: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
