// Function to open the modal
function openModal() {
    document.getElementById('authModal').style.display = 'block';
}

// Function to close the modal
function closeModal() {
    document.getElementById('authModal').style.display = 'none';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function toggleToRegister() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'block';
}

function toggleToLogin() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('authModal').style.display = 'block';
}

// Function to handle login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

     // Cache username and password in sessionStorage
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("password", password);

    // Send a request to authenticate
    fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, body: JSON.stringify({ username, password }),
    })
    
    .then(response => {
        if (response.ok) {
            alert('Authenticated successfully!');
            closeModal(); // Close the modal
            // goToHomePage(); // Navigate to the home page
        } else {
            alert('Authentication failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during authentication!');
    });
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch("http://localhost:8080/register", { // Adjust the URL as needed
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
           
        });
        console.log('UserName: ',username);
        console.log('Password: ',password);

        if (response.ok) {
            alert("Registration successful! Please log in.");
            toggleToLogin(); // Switch back to the login modal
        } else {
            const errorMessage = await response.text();
            alert(`Error registering: ${errorMessage}`);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert("An error occurred while trying to register. Please try again.");
    }
}
// Function to navigate to admin page
function goToHomePage() {
    window.location.href = '/index.html'; // Change to your admin page URL
}

// Automatically open the modal when the page loads
window.onload = function() {
    openModal(); // Open the modal on page load
};

function goToAdminPage() {
    window.location.href = 'admin.html'; // Adjust the URL to your actual admin page
}

// Function to generate employee code
document.getElementById("generateCodeBtn").addEventListener("click", async () => {

    // Clear previous output
    // document.getElementById("employeeCodeOutput").innerText = "";

    // try {
    //     const response = await fetch("http://localhost:8080/GenerateEmployeeId", { method: "POST" });
    try {
        // Retrieve cached credentials
        const username = sessionStorage.getItem("username");
        const password = sessionStorage.getItem("password");

        if (!username || !password) {
            alert("Please login first.");
            return;
        }

        const response = await fetch("http://localhost:8080/GenerateEmployeeId", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "username": username,
                "password": password
            }
        });

        if (response.ok) {
            const employeeCode = await response.text();
            document.getElementById("employeeCodeOutput").innerText = "Generated Employee Code: " + employeeCode;

            // Clear the output after a delay (optional)
            setTimeout(() => {
                document.getElementById("employeeCodeOutput").innerText = "";
            }, 30000); // Clear after 30 seconds
        } else {
            // Log the failed request
            await logFailedRequest('generateCode', `HTTP error! Status: ${response.status}`);
            alert("Error generating employee code. Please try again.");
        }
    } catch (error) {
        console.error("Error generating employee code:", error);
        await logFailedRequest('generateCode', error.message);
        alert("An error occurred while generating employee code.");
    }
});

// Function to log failed requests
async function logFailedRequest(action, error) {
    try {
        await fetch('http://localhost:8080/logFailedRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                error: error
            })
        });
    } catch (logError) {
        console.error("Error logging failed request:", logError);
    }
}

// Function to encode image file as Base64
function encodeImageFileAsURL() {
    const fileInput = document.getElementById('idPhoto');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            // Store the Base64-encoded image string
            window.base64ImageString = reader.result;
        };
        reader.readAsDataURL(file);
    } else {
        // Clear base64ImageString if no file is selected
        window.base64ImageString = null;
    }
}

// Handle form submission for employee registration
document.getElementById("registrationForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent form from submitting normally

    // Gather data from the form
    const employeeCode = document.getElementById("employeeCode").value;
    const surname = document.getElementById("surname").value;
    const otherName = document.getElementById("otherName").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const idPhoto = window.base64ImageString || null;

    const registrationData = {
        employeeCode: employeeCode,
        surname: surname,
        otherName: otherName,
        dateOfBirth: dateOfBirth,
        idPhoto: idPhoto
    };

    // Log the request data to the console
    console.log("Sending Registration Request:", JSON.stringify(registrationData, null, 2));

    try {
        const username = sessionStorage.getItem("username");
        const password = sessionStorage.getItem("password");

        if (!username || !password) {
            alert("Please login first.");
            return;
        }
        const response = await fetch("http://localhost:8080/EmployeeRequest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "username": username,
                "password": password
            
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();
        
        if (response.ok) {
            alert(result.message); // Show success message
            console.log("Employee Number: " + result.employeeNumber); // Log or display the employee number
            document.getElementById('employeeNumberOutput').innerText = "Employee Number: " + result.employeeNumber;
            // Clear the form fields after successful registration
            document.getElementById("registrationForm").reset();
            window.base64ImageString = null; // Clear the Base64 image string
        } else {
            // Log the failed registration request
            await logFailedRequest('registerEmployee', result.message, result.httpStatusCode);
            alert("Error: " + result.message); // Show error message
        }
    } catch (error) {
        console.error("Error:", error);
        // Log the failed registration request
        await logFailedRequest('registerEmployee', error.message);
        alert("An error occurred while registering the employee.");
    }
});

async function logFailedRequest(action, error, httpStatusCode) {
    try {
        await fetch('http://localhost:8080/logFailedRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                error: error,
                httpStatusCode: httpStatusCode,  // Include status code
               
            })
        });
    } catch (logError) {
        console.error("Error logging failed request:", logError);
    }
}



async function retrieveEmployee() {
    const employeeNumber = document.getElementById('employeeNumber').value;
    let url = 'http://localhost:8080/employees';

    if (employeeNumber) {
        url += `?employeeNumber=${encodeURIComponent(employeeNumber)}`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error retrieving employee data");
        }

        const responseData = await response.json();
        const employees = responseData.data;

        document.getElementById('employeeDetails').innerHTML = ''; // Clear previous results

        if (Array.isArray(employees) && employees.length > 0) {
            // If only one employee is returned, display with edit button
            if (employees.length === 1) {
                displayEmployees(employees[0], true); // Pass true to indicate one employee
            } else {
                employees.forEach(employee => displayEmployees(employee, false)); // Pass false for multiple employees
            }
        } else {
            document.getElementById('employeeDetails').innerHTML = "No employees found.";
        }

    } catch (error) {
        console.error("Error retrieving employee data: ", error);
        document.getElementById('employeeDetails').innerHTML = error.message;
    }
}

function displayEmployees(employee, showEditButton) {
    const employeeDetailsDiv = document.getElementById('employeeDetails');

    // Construct HTML for the employee
    let employeeHTML = `
        <div class="employee-card">
            <div class="employee-info">
                ${employee.idPhoto ? `<img class="employee-photo" src="${employee.idPhoto}" alt="Employee Photo" />` : '<p>No Photo Available</p>'}
                <div class="employee-details">
                    <p><strong>Employee Number:</strong> ${employee.employeeNumber}</p>
                    <p><strong>Surname:</strong> ${employee.surname}</p>
                    <p><strong>Other Name:</strong> ${employee.otherName}</p>
                    <p><strong>Date of Birth:</strong> ${employee.dateOfBirth}</p>
                </div>
            </div>
        </div>
    `;

    // Add an Edit button only if it's a single employee detail queried
    if (showEditButton) {
        employeeHTML += `<button class="edit-button" id="editButton" onclick="enableUpdateFields('${employee.employeeNumber}', '${employee.dateOfBirth}', '${employee.idPhoto}')">EDIT EMPLOYEE DETAILS</button>`;    }

    employeeDetailsDiv.innerHTML += employeeHTML; // Append to the details div
}

// Enable update fields
function enableUpdateFields(employeeNumber, dateOfBirth, idPhoto) {
    document.getElementById('updateEmployeeNumber').value = employeeNumber;
    document.getElementById('updateDateOfBirth').value = dateOfBirth;
    document.getElementById('employee-update').style.display = 'block'; // Show the update section

    // If there's an existing photo, you can add additional logic here if needed
}

// Update employee data
document.getElementById('updateButton').addEventListener('click', async function() {
    const employeeNumber = document.getElementById('updateEmployeeNumber').value;
    const dateOfBirth = document.getElementById('updateDateOfBirth').value;
    const idPhoto = document.getElementById('updateIdPhoto').files[0];

    let idPhotoBase64 = '';

    if (idPhoto) {
        const reader = new FileReader();
        reader.onload = async function() {
            idPhotoBase64 = reader.result;

            await updateEmployee(employeeNumber, dateOfBirth, idPhotoBase64);
        }
        reader.readAsDataURL(idPhoto);
    } else {
        await updateEmployee(employeeNumber, dateOfBirth, null);
    }
});

async function updateEmployee(employeeNumber, dateOfBirth, idPhoto) {
    
    const url = `http://localhost:8080/employees/${employeeNumber}`; // Adjust URL to match your API endpoint
    const body = {
        dateOfBirth: dateOfBirth,
        idPhoto: idPhoto
    };

    try {
        const username = sessionStorage.getItem("username");
        const password = sessionStorage.getItem("password");

        if (!username || !password) {
            alert("Please login first.");
            return;
        }
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "username": username,
                "password": password
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error updating employee data");
        }

        // Successful update, show success message
        const successMessage = "Employee details updated successfully.";
        document.getElementById('employeeDetails').innerHTML = successMessage;
        document.getElementById('employee-update').style.display = 'none'; // Hide update section
        document.getElementById('employeeNumber').value = ''; // Clear the input field
    } catch (error) {
        console.error("Error updating employee data: ", error);
        document.getElementById('employeeDetails').innerHTML = error.message;
    }
}

// Event listener for the retrieve button
document.getElementById('retrieveButton').addEventListener('click', async function() {
    await retrieveEmployee();
});
function goToAdminPage() {
    const password = prompt("Please enter the admin password:");
    if (password === "1234") { // Change 'yourAdminPassword' to your actual password
        window.location.href = 'admin.html'; // Redirect to the admin page
    } else {
        alert("Incorrect password. Access denied.");
    }
}