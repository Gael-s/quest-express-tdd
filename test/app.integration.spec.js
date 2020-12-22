const request = require("supertest");
const app = require("../app");
const db = require("../connection");

describe("Test routes", () => {
  beforeEach((done) => db.query("TRUNCATE bookmark", done));
  it('GET / sends "Hello World" as json', (done) => {
    request(app)
      .get("/")
      .expect(200)
      .expect("Content-Type", /json/)
      .then((response) => {
        const expected = { message: "Hello World!" };
        expect(response.body).toEqual(expected);
        done();
      });
  });
  it("POST /bookmarks error", (post) => {
    request(app)
      .post("/bookmarks")
      .send({})
      .expect(422)
      .then((response) => {
        const expected = { error: "required fields missing" };
        post();
      });
  });
  it("POST /bookmarks ok", (done) => {
    request(app)
      .post("/bookmarks")
      .send({ url: "https://jestjs.io", title: "Jest" })
      .expect(201)
      .then((response) => {
        const expected = {
          id: expect.any(Number),
          url: "https://jestjs.io",
          title: "Jest",
        };
        expect(response.body).toEqual(expected);
        done();
      });
  });

  describe("GET /bookmarks/:id", () => {
    const testBookmark = { url: "https://nodejs.org/", title: "Node.js" };
    beforeEach((done) =>
      db.query("TRUNCATE bookmark", () =>
        db.query("INSERT INTO bookmark SET ?", testBookmark, done)
      )
    );
    it("GET /bookmarks/:id error", (done) => {
      request(app)
        .get("/bookmarks/:id")
        .expect(404)
        .send({ error: "Bookmark not found" })
        .then((response) => {
          const expected = { error: "Bookmark not found" };
          expect(response.body).toEqual(expected);
          done();
        });
    });

    it("GET /bookmarks/:id ok", (done) => {
      request(app)
        .get("/bookmarks/1")
        .expect(200)
        .then((response) => {
          const expected = {
            id: 1,
            url: "https://nodejs.org/",
            title: "Node.js",
          };
          expect(response.body).toEqual(expected);
          done();
        });
    });
  });
});
