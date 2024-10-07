// Registration functionality
document.getElementById("registrationForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    registerUser(username, password);
});

async function registerUser(username, password) {
    try {
        const response = await fetch('http://localhost:8080/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // alert('Registration successful! Please log in.');
            console.log("Redirecting to /login...");
            window.location.href = 'http://127.0.0.1:5502/login';
        } else {
            const errorData = await response.json();
            alert('Registration failed: ' + errorData.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}