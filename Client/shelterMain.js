const shelterSelect = document.getElementById('shelterSelect');
const sizeSelect = document.getElementById('sizeSelect');
const animalList = document.getElementById('animalList');
const animalProfile = document.getElementById('animalProfile');
const shelterDetails = document.getElementById('shelterDetails');
const formError = document.getElementById('formError');
const form = document.getElementById('animalForm');
const connectionAlert = document.getElementById('connectionAlert');

// Wrapper for fetch to handle connection errors
async function fetchSafely(url, options = {}) {
    try {
        const response = await fetch(url, options);
        // If we connect successfully, hide the error alert
        connectionAlert.classList.add('d-none');
        return response;
    } catch (error) {
        // Display an error message if the server cannot be reached
        connectionAlert.textContent = "Server connection lost. Please ensure server is running.";
        connectionAlert.classList.remove('d-none');
        throw error;
    }
}

//Load shelters into the dropdown

async function loadShelters() {
    try {
        const response = await fetchSafely('/api/shelters');
        const shelters = await response.json();

        // Reset the dropdown menu
        shelterSelect.innerHTML = '<option value="">Select Shelter</option>';

        // Add each shelter to the dropdown
        shelters.forEach(function(shelter) {
            const option = document.createElement('option');
            option.value = shelter.id;
            option.textContent = shelter.name;
            shelterSelect.appendChild(option);
        });

    } catch (err) {
        console.warn("Could not load shelters");
    }
}

//Event Listeners

// Event listener for Shelter selection 
shelterSelect.addEventListener('change', async function () {
    // Clear previous details
    shelterDetails.innerHTML = '';
    animalProfile.classList.add('d-none');

    if (!this.value) {
        return;
    }

    try {
        const response = await fetchSafely('/api/shelters/' + this.value);
        if (!response.ok) return;

        const shelterData = await response.json();
        
        // Display shelter name and number of animals
        shelterDetails.innerHTML = `
            <div class="alert alert-info">
                <strong>${shelterData.shelter.name}</strong><br>
                Animals here: ${shelterData.animals.length}
            </div>
        `;
    } catch (err) {
        console.warn("Error loading shelter details");
    }
});

// Event listener for Load Animals button
document.getElementById('loadAnimals').addEventListener('click', async function () {
    // Clear previous lists
    animalList.innerHTML = '';
    animalProfile.classList.add('d-none');

    const animalSearchParams = new URLSearchParams();
    if (shelterSelect.value) {
        animalSearchParams.append('shelterId', shelterSelect.value);
    }
    if (sizeSelect.value) {
        animalSearchParams.append('size', sizeSelect.value);
    }

    try {
        const response = await fetchSafely('/api/animals?' + animalSearchParams.toString());
        const animals = await response.json();

        if (animals.length === 0) {
            animalList.innerHTML = '<div class="list-group-item">No animals found.</div>';
            return;
        }

        animals.forEach(function(animal) {
            const animalButton = document.createElement('button');
            animalButton.className = 'list-group-item list-group-item-action';
            animalButton.textContent = animal.name;
            
            // Add click event to show profile
            animalButton.addEventListener('click', function() {
                animalProfile.classList.remove('d-none');
                
                let imgPath = 'images/placeholder.jpg';
                if (animal.image) {
                    // Chat GPT code correction start: Cache-busting query string of "+ '?t=' + new Date().getTime()" to force image refresh without needing to refresh page.
                    imgPath = 'images/' + animal.image + '?t=' + new Date().getTime();
                    // Chat GPT code correction end.
                }

                animalProfile.innerHTML = `
                    <div class="card-body d-flex gap-3">
                        <img src="${imgPath}" style="width:190px; height:190px; object-fit:cover;" class="rounded">
                        <div>
                            <h4>${animal.name}</h4>
                            <p><strong>Type:</strong> ${animal.type}</p>
                            <p><strong>Size:</strong> ${animal.size}</p>
                            <p><strong>Age:</strong> ${animal.age}</p>
                            <p><strong>Animal ID:</strong> ${animal.id}</p>
                        </div>
                    </div>
                `;
            });

            animalList.appendChild(animalButton);
        });
    } catch (err) {
        console.warn("Error loading animals");
    }
});

//Add new animal

form.addEventListener('submit', async function (event) {
    event.preventDefault(); // To prevent page from refreshing
    formMessage.textContent = ''; // Clear previous errors
    formMessage.className = ''; 

    // Gather form data
    const formData = new FormData(form);
    
    try {
        const response = await fetchSafely('/api/animals/new', {
            method: 'POST',
            body: formData 
        });
        // Check for server-side validation errors
        if (!response.ok) {
            const formErrorMessage = await response.text();
            formMessage.textContent = formErrorMessage;
            formMessage.className = 'text-danger';
            return;
        }

        // Success so reset form and refresh list
        form.reset();
        formMessage.textContent = 'Animal added successfully!';
        formMessage.className = 'text-success';
        document.getElementById('loadAnimals').click(); 

    } catch (err) {
        formMessage.textContent = 'Submission failed.';
        formMessage.className = 'text-danger';
    }
});

// Edit Existing Animal Form
const editForm = document.getElementById('editAnimalForm');
const editFormMessage = document.getElementById('editFormMessage');

editForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    editFormMessage.textContent = '';
    editFormMessage.className = '';

    const formData = new FormData(editForm);

    try {
        const response = await fetchSafely('/api/animals/edit', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const message = await response.text();
            editFormMessage.textContent = message;
            editFormMessage.className = 'text-danger';
            return;
        }

        editForm.reset();
        editFormMessage.textContent = 'Animal updated successfully!';
        editFormMessage.className = 'text-success';
        document.getElementById('loadAnimals').click();

    } catch (err) {
        editFormMessage.textContent = 'Update failed.';
        editFormMessage.className = 'text-danger';
    }
});

// Initialize
loadShelters();