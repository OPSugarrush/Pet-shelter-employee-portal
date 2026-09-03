const request = require('supertest');
const app = require('./app');

describe('Pet Shelter API Tests', () => {

    // Shelter endpoints GET tests
     
    test('GET /api/shelters succeeds', () => {
        return request(app)
            .get('/api/shelters')
            .expect(200);
    });

    test('GET /api/shelters returns JSON', () => {
        return request(app)
            .get('/api/shelters')
            .expect('Content-Type', /json/);
    });

    test('GET /api/shelters/:id succeeds for valid shelter', () => {
        return request(app)
            .get('/api/shelters/1')
            .expect(200);
    });

    test('GET /api/shelters/:id returns JSON', () => {
        return request(app)
            .get('/api/shelters/1')
            .expect('Content-Type', /json/);
    });

    test('GET /api/shelters/:id includes animals', () => {
        return request(app)
            .get('/api/shelters/1')
            .expect(/animals/);
    });

    test('GET /api/shelters/:id returns 404 for invalid shelter', () => {
        return request(app)
            .get('/api/shelters/999')
            .expect(404);
    });

    // Animal query and filter endpoints GET tests

    test('GET /api/animals returns animals', () => {
        return request(app)
            .get('/api/animals')
            .expect(200)
            .expect('Content-Type', /json/);
    });

    test('GET /api/animals?size=Small filters correctly', () => {
        return request(app)
            .get('/api/animals?size=Small')
            .expect(200)
            .expect(/Small/);
    });

    test('GET /api/animals with invalid size returns empty list', async () => {
        const response = await request(app)
            .get('/api/animals?size=Invalid')
            .expect(200);

        expect(response.body.length).toBe(0);
    });

    // Add animal POST tests

    test('POST /api/animals/new succeeds with valid data', () => {
        const params = {
            name: "TestDog_" + Date.now(),
            type: "Dog",
            size: "Medium",
            age: 5,
            shelterId: 1
        };

        return request(app)
            .post('/api/animals/new')
            .send(params)
            .expect(201);
    });

    test('POST /api/animals/new fails when required data is missing', () => {
        return request(app)
            .post('/api/animals/new')
            .send({ name: 'Incomplete' })
            .expect(400);
    });

    test('POST /api/animals/new fails with invalid type', () => {
        return request(app)
            .post('/api/animals/new')
            .send({
                name: "Buddy",
                type: "Bird",
                size: "Medium",
                age: 3,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/new fails with invalid size', () => {
        return request(app)
            .post('/api/animals/new')
            .send({
                name: "BadSizeDog",
                type: "Dog",
                size: "Huge",
                age: 5,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/new fails with invalid age', () => {
        return request(app)
            .post('/api/animals/new')
            .send({
                name: "TooOldDog",
                type: "Dog",
                size: "Medium",
                age: 100,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/new fails with invalid shelter ID', () => {
        return request(app)
            .post('/api/animals/new')
            .send({
                name: "Buddy",
                type: "Dog",
                size: "Medium",
                age: 3,
                shelterId: 99
            })
            .expect(400);
    });

    test('POST /api/animals/new fails when duplicate animal exists', () => {
        return request(app)
            .post('/api/animals/new')
            .send({
                name: "Buddy",
                type: "Dog",
                size: "Medium",
                age: 3,
                shelterId: 1
            })
            .expect(400);
    });

    // Edit animal POST tests

    test('POST /api/animals/edit succeeds with valid data', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                id: 5,
                name: "John",
                type: "Cat",
                size: "Medium",
                age: 10,
                shelterId: 1
            })
            .expect(200);
    });

    test('POST /api/animals/edit fails when animal does not exist', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                id: 100,
                name: "NonExistentAnimal" + Date.now(),
                type: "Dog",
                size: "Medium",
                age: 5,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails when animal name matches an existing animal and animal id does match but animal type does not match', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                id: 1,
                name: "Buddy",
                type: "Cat",
                size: "Medium",
                age: 5,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails when animal name matches an existing animal and the animal type does match, but the animal id does not match', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                id: 100,
                name: "Buddy",
                type: "Dog",
                size: "Medium",
                age: 5,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails when animal id matches an existing animal and the animal type does match, but the animal name does not match', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                id: 1,
                name: "Buddson",
                type: "Dog",
                size: "Medium",
                age: 5,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails when required data is missing', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({ name: 'Incomplete' })
            .expect(400);
    });

    test('POST /api/animals/edit fails with invalid type', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                name: "Buddy",
                type: "Bird",
                size: "Medium",
                age: 3,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails with invalid size', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                name: "Buddy",
                type: "Dog",
                size: "Huge",
                age: 3,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails with invalid age', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                name: "Buddy",
                type: "Dog",
                size: "Medium",
                age: 99,
                shelterId: 1
            })
            .expect(400);
    });

    test('POST /api/animals/edit fails with invalid shelter ID', () => {
        return request(app)
            .post('/api/animals/edit')
            .send({
                name: "Buddy",
                type: "Dog",
                size: "Medium",
                age: 3,
                shelterId: 99
            })
            .expect(400);
    });

});
