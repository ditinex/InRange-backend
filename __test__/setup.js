const request = require('supertest');
const mongoose = require('mongoose');
const config = require('../config.js');
const { Admin } = require('../models')
const app = request(global.config.apiurl);

exports.Test = () => {

    beforeAll(async (done) => {
        await mongoose.connect(config.mongodb.connectionString, { auth:{authdb:"admin"}, useNewUrlParser: true, useUnifiedTopology: true, autoIndex: true, useCreateIndex: true, useFindAndModify: false });
        const user = await Admin.findOne({ email: 'demo@demo.com' })
        if(user)
            global.config.user_id = user._id
        const deleted = await Admin.deleteOne({ email: 'demo@demo.com' })
        done()
    });

    it("Testing server response.", async (done) => {
        app.get("/")
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                expect(res.body.message).toEqual("API Server Running.");
                expect(res.body.status).toEqual("success");
                return done();
            });
    });

    afterAll(async (done) => {
        mongoose.connection.close()
        done()
    });

}


/*
 * Additional Functions
 */