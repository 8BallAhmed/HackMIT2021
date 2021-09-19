const models = require("./model");
const Assessment = models.Assessment;
const AssessmentMaster = models.AssessmentMaster;
const mongoose = models.mongoose;
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { type } = require("os");
const { Mongoose } = require("mongoose");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});

app.post("/register", (req, res) => {
    console.log("registration request received!");
    const body = req.body;
    if (body.username == undefined) {
        res.end(JSON.stringify({ status: 400, message: "Username not included!" }));
    }
    if (body.password == undefined) {
        res.end(JSON.stringify({ status: 400, message: "Password not included!" }));
    }
    if (body.firstname == undefined) {
        res.end(
            JSON.stringify({ status: 400, message: "First name not included!" })
        );
    }

    if (body.lastname == undefined) {
        res.end(
            JSON.stringify({ status: 400, message: "Last name not included!" })
        );
    }

    if (body.email == undefined) {
        res.end(JSON.stringify({ status: 400, message: "Email not included!" }));
    }

    AssessmentMaster.findOne({ username: body.username }).then((result) => {
        if (result == undefined) {
            const id = new mongoose.Types.ObjectId();
            const assessmentMaster = new AssessmentMaster({
                id: id,
                username: body.username,
                password: body.password,
                firstname: body.firstname,
                lastname: body.lastname,
                email: body.email,
            });
            assessmentMaster.save().then(() => {
                res.end(
                    JSON.stringify({ status: 200, message: "User created!", id: id })
                );
            });
        } else {
            res.end(JSON.stringify({ status: 401, message: "User already exists!" }));
        }
    });
});

app.post("/login", (req, res) => {
    console.log("Login request received!");
    const body = req.body;
    if (body.username == undefined) {
        res.end(JSON.stringify({ status: 400, message: "Username not included!" }));
    }
    if (body.password == undefined) {
        res.end(JSON.stringify({ status: 400, message: "Password not included!" }));
    }

    AssessmentMaster.findOne({ username: body.username }).then((result) => {
        if (result == undefined) {
            res.end(JSON.stringify({ status: 404, message: "User does not exist!" }));
        } else {
            res.end(
                JSON.stringify({
                    status: 200,
                    message: "Login Successful!",
                    id: result.id,
                })
            );
        }
    });
});

app.get("/assessments/:id", (req, res) => {
    const params = req.params;
    const id = params.id;
    if (id == undefined) {
        res.end(
            JSON.stringify({ status: 400, message: "ID Not specified in query!" })
        );
    }

    Assessment.findOne({ id: id }).then((result) => {
        if (result == undefined) {
            res.end(
                JSON.stringify({ status: 404, message: "Assessment not found!" })
            );
        } else {
            res.end(JSON.stringify({ status: 200, assessment: result }));
        }
    });
});

app.post("/fetchAssessments", (req, res) => {
    console.log('Assessment(s) fetch request received!')
    const body = req.body;
    const ownerID = body.ownerID;
    if (ownerID == undefined) {
        res.end(
            JSON.stringify({ status: 400, message: "Owner ID not specified!" })
        );
        return;
    }
    const assessments = Assessment.find({ ownerID: ownerID })
        .exec()
        .then((result) => {
            res.end(JSON.stringify({ status: 200, assessments: result }));
        });
});

app.delete("/assessments", (req, res) => {
    const body = req.body;
    const id = body.id;
    if (id == undefined) {
        res.end(
            JSON.stringify({
                status: 400,
                message: "ID of assessment to delete was not specified!",
            })
        );
    }
    Assessment.findOne({ id: id }).then((result) => {
        if (result == undefined) {
            res.end(
                JSON.stringify({
                    status: 404,
                    message: "Assessment not found, in order to delete!",
                })
            );
        } else {
            Assessment.deleteOne({ id: id }).then(() => {
                res.end(
                    JSON.stringify({
                        status: 200,
                        message: "Assessment deleted!",
                        assessment: result,
                    })
                );
            });
        }
    });
});

app.post("/assessments", (req, res) => {
    try {
        const body = req.body;
        const ownerID = body.ownerID;
        AssessmentMaster.findOne({ id: ownerID }).then((result) => {
            if (result == undefined) {
                res.end(
                    JSON.stringify({
                        status: 404,
                        message: "User not found! ID does not exist, cannot add assessment.",
                    })
                );
            } else {
                const id = new mongoose.Types.ObjectId();
                const name = body.name;
                const totalPoints = body.totalPoints;
                const questions = body.questions;
                if (ownerID == undefined) {
                    res.end(
                        JSON.stringify({ status: 400, message: "Owner ID not specified!" })
                    );
                }
                if (name == undefined) {
                    res.end(
                        JSON.stringify({
                            status: 400,
                            message: "Assessment name not specified!",
                        })
                    );
                }
                if (totalPoints == undefined) {
                    res.end(
                        JSON.stringify({
                            status: 400,
                            message: "Total # of points for this assessment was not specified!",
                        })
                    );
                }
                if (questions == undefined) {
                    res.end(
                        JSON.stringify({
                            status: 400,
                            message: "Questions for this assessment were not specified!",
                        })
                    );
                }

                if (!Array.isArray(questions)) {
                    res.end(
                        JSON.stringify({
                            status: 400,
                            message: "The Questions for this assessment were not sent in Array form!",
                        })
                    );
                }
                let assessment = new Assessment({
                    ownerID: ownerID,
                    id: id,
                    name: name,
                    totalPoints: totalPoints,
                    participants: [],
                    questions: questions,
                });

                assessment.save().then(() => {
                    result.forms.push({ id: id });
                    result.save().then(() => {
                        res.end(
                            JSON.stringify({
                                status: 200,
                                message: "Assessment Created!",
                                assessment: assessment,
                            })
                        );
                    });
                });
            }
        });
        //1. Fetch user using OwnerID
        //2. Update forms, to include new Assessment's ID
        //3. Save User object, and commit to DB
    } catch (ex) {
        res.end(
            JSON.stringify({
                status: 400,
                message: "Wrong JSON formatting, its an internal server error but we caught it.",
            })
        );
    }
});

app.patch("/assessments", (req, res) => {
    const body = req.body;
    const id = body.id;
    const name = body.name;
    const totalPoints = body.totalPoints;
    const questions = body.questions;
    if (id == undefined) {
        res.end(
            JSON.stringify({
                status: 400,
                message: "ID Not specified in order to patch Assessment!",
            })
        );
    }
    const assessment = Assessment.findOne({ id: id }).then((result) => {
        if (result == undefined) {
            res.end(
                JSON.stringify({
                    status: 404,
                    message: "Assessment not found, cannot update!",
                })
            );
        }
        if (name != undefined) {
            result.name = name;
        }
        if (totalPoints != undefined) {
            result.totalPoints = totalPoints;
        }
        if (questions != undefined) {
            result.questions = questions;
        }
        result.save().then(() => {
            Assessment.findOne({ id: id }).then((result) => {
                res.end(
                    JSON.stringify({
                        status: 200,
                        message: "Assessment updated!",
                        assessment: result,
                    })
                );
            });
        });
    });
});