const request = require('supertest');
const app = request(global.config.apiurl);

exports.Test = () => {

/*
 * Admin Auth
 */

  it("Auth - Invalid email check.", async (done) => {
    app.post("/admins/signup")
      .send({name: 'Demo', email: 'demodemo.com', password: 'Demo#123', type: 'admin'})
      .expect(202)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("failed");
        return done();
      });
  });

  it("Auth - Weak Password check.", async (done) => {
    app.post("/admins/signup")
      .send({name: 'Demo', email: 'demo@demo.com', password: '12345', type: 'admin'})
      .expect(202)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("failed");
        return done();
      });
  });

  it("Auth - Invalid name check (containing special character).", async (done) => {
    app.post("/admins/signup")
      .send({name: '@', email: 'demo@demo.com', password: 'Demo#123', type: 'admin'})
      .expect(202)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("failed");
        return done();
      });
  });

  it("Auth - Invalid name check (containing only space).", async (done) => {
    app.post("/admins/signup")
      .send({name: ' ', email: 'demo@demo.com', password: 'Demo#123', type: 'admin'})
      .expect(202)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("failed");
        return done();
      });
  });

  it("Auth - Invalid name check (empty string).", async (done) => {
    app.post("/admins/signup")
      .send({name: '', email: 'demo@demo.com', password: 'Demo#123', type: 'admin'})
      .expect(202)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("failed");
        return done();
      });
  });

  it("Auth - New admin account.", async (done) => {
    app.post("/admins/signup")
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

  it("Auth - Check whether account already exists.", async (done) => {
    app.post("/admins/signup")
      .send({name: 'Demo', email: 'demo@demo.com', password: 'Demo#123', type: 'admin'})
      .expect(202)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body.status).toEqual("failed");
        return done();
      });
  });

}
