const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Load initial data in json
let data = require('./animals.json');

app.use(express.static('client'));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // path.join so it works on both Windows and Mac/Linux
    // Standardised to lowercase client/images for consistency
    cb(null, path.join(__dirname, 'client', 'images'));
  },
  filename: function (req, file, cb) {
    // Create a clean filename based on the animal's name
    let cleanName = 'unknown';

    if (req.body.name) {
      // Convert to lowercase and remove spaces
      cleanName = req.body.name.toLowerCase().replace(/\s+/g, '');
    }

    // Combine the clean name with the extension
    cb(null, cleanName + '.jpg');
  }
});

const upload = multer({ storage: storage });


// GET /api/shelters
app.get('/api/shelters', function (req, resp) {
  resp.json(data.shelters);
});

// GET /api/shelters/:id
app.get('/api/shelters/:id', function (req, resp) {
  const id = parseInt(req.params.id);
  const shelter = data.shelters.find(s => s.id === id);

  if (!shelter) {
    resp.status(404).json({ error: 'Shelter not found' });
    return;
  }

  // Find all animals that belong to this shelter ID
  const residents = data.animals.filter(a => a.shelterId === id);

  resp.json({
    shelter: shelter,
    animals: residents
  });
});

// GET /api/animals
app.get('/api/animals', function (req, resp) {
  let results = data.animals;

  // Filter by size if the query parameter exists
  if (req.query.size) {
    results = results.filter(a => a.size === req.query.size);
  }

  // Filter by shelter if the query parameter exists
  if (req.query.shelterId) {
    results = results.filter(a => a.shelterId == req.query.shelterId);
  }

  resp.json(results);
});

// POST /api/animals/new

app.post('/api/animals/new', upload.single('image'), function (req, resp) {
  // Extract data from the request body
  const name = req.body.name;
  const type = req.body.type;
  const size = req.body.size;
  const age = req.body.age;
  const shelterId = req.body.shelterId;

  // Deal with possibility of no image uploaded
  let imageFilename = null;
  if (req.file) {
    imageFilename = req.file.filename;
  }

  // Check if all required fields are present
  if (!name || !type || !size || !age || !shelterId) {
    resp.status(400).send('All fields are required.');
    return;
  }

  const numericAge = parseInt(age);
  const numericShelterId = parseInt(shelterId);

  // Validate Size 
  if (size !== 'Small' && size !== 'Medium' && size !== 'Large') {
    resp.status(400).send('Size must be Small, Medium, or Large.');
    return;
  }

  // Validate Age
  if (numericAge < 1 || numericAge > 30) {
    resp.status(400).send('Age must be between 1 and 30.');
    return;
  }

  // Validate Shelter ID
  if (numericShelterId < 1 || numericShelterId > 5) {
    resp.status(400).send('Shelter ID must be between 1 and 5.');
    return;
  }

  // Validate Type
  if (type !== 'Dog' && type !== 'Cat') {
    resp.status(400).send('Type must be Dog or Cat.');
    return;
  }

  // Check for duplicates in the specific shelter
  const exists = data.animals.some(function (animal) {
    const nameMatch = animal.name.toLowerCase() === name.toLowerCase();
    const shelterMatch = animal.shelterId === numericShelterId;
    return nameMatch && shelterMatch;
  });

  if (exists) {
    resp.status(400).send('Animal already exists in this shelter.');
    return;
  }

  // Create the new animal object
  const newAnimal = {
    id: data.animals.length + 1,
    name: name,
    type: type,
    size: size,
    age: numericAge,
    shelterId: numericShelterId,
    image: imageFilename
  };

  // Save to data and update the JSON
  data.animals.push(newAnimal);
  fs.writeFileSync(path.join(__dirname, 'animals.json'), JSON.stringify(data, null, 2));

  resp.status(201).send('Animal added successfully');
});

// POST /api/animals/edit
app.post('/api/animals/edit', upload.single('image'), function (req, resp) {

  const id = req.body.id;
  const name = req.body.name;
  const type = req.body.type;
  const newSize = req.body.size;
  const newAge = req.body.age;
  const newShelterId = req.body.shelterId;

  if (!id || !name || !type || !newSize || !newAge || !newShelterId) {
    resp.status(400).send('All fields are required.');
    return;
  }

  const numericAge = parseInt(newAge);
  const numericShelterId = parseInt(newShelterId);

  if (newSize !== 'Small' && newSize !== 'Medium' && newSize !== 'Large') {
    resp.status(400).send('Size must be Small, Medium, or Large.');
    return;
  }

  if (numericAge < 1 || numericAge > 30) {
    resp.status(400).send('Age must be between 1 and 30.');
    return;
  }

  if (numericShelterId < 1 || numericShelterId > 5) {
    resp.status(400).send('Shelter ID must be between 1 and 5.');
    return;
  }

  if (type !== 'Dog' && type !== 'Cat') {
    resp.status(400).send('Type must be Dog or Cat.');
    return;
  }

  const animal = data.animals.find(a =>
    a.name.toLowerCase() === name.toLowerCase() &&
    a.type === type &&
    a.id == id
  );

  if (!animal) {
    resp.status(400).send('Animal not found.');
    return;
  }

  // Remove old image if replacing
  if (req.file) {

    // Only delete the old image if it has a DIFFERENT filename
    if (animal.image && animal.image !== req.file.filename) {
      const oldImagePath = path.join(__dirname, 'client', 'images', animal.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update image reference
    animal.image = req.file.filename;
  }


  animal.size = newSize;
  animal.age = numericAge;
  animal.shelterId = numericShelterId;


  fs.writeFileSync(
    path.join(__dirname, 'animals.json'),
    JSON.stringify(data, null, 2)
  );

  resp.status(200).send('Animal updated successfully.');
});

// Start the server
module.exports = app;