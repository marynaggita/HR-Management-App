document.getElementById("generateCodeBtn").addEventListener("click", async () => {
    const response = await fetch("http://localhost:8080/GenerateEmployeeId", { method: "POST" });
    const employeeCode = await response.text();
    document.getElementById("employeeCodeOutput").innerText = "Generated Employee Code: " + employeeCode;
});


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
    }
}

document.getElementById("registrationForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Prevent form from submitting normally

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
        const response = await fetch("http://localhost:8080/EmployeeRequest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();
        
        if (response.ok) {
            alert( result.message);
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while registering the employee.");
    }
});

// document.getElementById('retrieveButton').addEventListener('click', function() {
//     // const employeeNumber = document.getElementById('employeeNumber').value;
//     // const formData = new FormData();
    

// });

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
        <div>
            ${employee.idPhoto ? `<img class="employee-photo" src="${employee.idPhoto}" alt="Employee Photo" />` : '<p>No Photo Available</p>'}
            <p><strong>Employee Number:</strong> ${employee.employeeNumber}</p>
            <p><strong>Surname:</strong> ${employee.surname}</p>
            <p><strong>Other Name:</strong> ${employee.otherName}</p>
            <p><strong>Date of Birth:</strong> ${employee.dateOfBirth}</p>
        </div>
        <hr>
    `;

    // Add an Edit button only if it's a single employee detail queried
    if (showEditButton) {
        employeeHTML += `<button id="editButton" onclick="enableUpdateFields('${employee.employeeNumber}', '${employee.dateOfBirth}', '${employee.idPhoto}')">Edit</button>`;
    }

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
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
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
