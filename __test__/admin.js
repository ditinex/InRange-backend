const request = require('supertest');
const app = request(global.config.apiurl);

exports.Test = () => {

  beforeAll(() => {
        
  });

  it("New admin account.", async () => {
    app.get("/admins/signup")
      .send({name: 'Demo', email: 'demo@demo.com', password: 'Demo#123', type: 'admin'})
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("success");
        return done();
      });
  });

  it("Account already exists.", async () => {
    app.get("/admins/signup")
      .send({name: 'Demo', email: 'demo@demo.com', password: 'Demo#123', type: 'admin'})
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("success");
        return done();
      });
  });

}



/*
 * Additional Functions
 */