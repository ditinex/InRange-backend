// we will use supertest to test HTTP requests/responses
const request = require("supertest");
// we also need our app for the correct routes!
const app = require("../app");

test("It adds two numbers", () => {
    expect(1 + 1).toBe(2);
  });