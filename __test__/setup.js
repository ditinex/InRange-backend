const request = require('supertest');
const app = request(global.config.apiurl);

exports.Test = () => {

    beforeAll(() => {
        
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

    afterAll(() => {

    });

}


/*
 * Additional Functions
 */