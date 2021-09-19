const mongoose = require("mongoose");
const { Schema } = mongoose;

main().catch((err) => console.log(err));

async function main() {
    await mongoose
        .connect(
            "mongodb+srv://admin:tAmaRaiSaWesOmE2020!@hackmit.p4acw.mongodb.net/test"
        )
        .then(() => {
            console.log(
                `Connection established to MongoDB! Creating Schemas.........`
            );
        });
}

const assessmentMaster = mongoose.Schema({
    id: String,
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    forms: [{ id: String }],
});

const assessment = mongoose.Schema([{
    ownerID: String,
    id: String,
    name: String,
    totalPoints: Number,
    participants: [{
        userID: Number,
        grade: Number,
        startDate: Date,
        endDate: Date,
    }, ],
    questions: [{
        text: String,
        points: Number,
        answers: [{ text: String, correct: Boolean }],
    }, ],
}, ]);

const AssessmentMaster = mongoose.model("User", assessmentMaster);
const Assessment = mongoose.model("Assessment", assessment);
console.log(`Models created!`);
const assessment1 = new Assessment({
    ownerID: 1,
    id: 5,
    name: "Coffee assessment",
    totalPoints: 15,
    participants: [],
    questions: [{
        text: "How many cups of coffee does ahmed drink?",
        points: 15,
        answers: [
            { text: "1", correct: false },
            { text: "2", correct: false },
            { text: "3", correct: false },
            { text: "4", correct: true },
        ],
    }, ],
});
//assessment1.save().then(() => console.log(`Assessment created!`));
module.exports.Assessment = Assessment;
module.exports.AssessmentMaster = AssessmentMaster;
module.exports.mongoose = mongoose;