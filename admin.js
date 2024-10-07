document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8080/adminMetrics')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalRequests').innerText = data.totalEmployeeCodes || 0;
            document.getElementById('totalRegistrations').innerText = data.totalEmployees || 0;
            // document.getElementById('totalUpdates').innerText = data.totalUpdates || 0;
            // document.getElementById('pendingApprovals').innerText = data.pendingApprovals || 0;
        })
        .catch(error => console.error('Error fetching metrics:', error));
});
async function fetchFailedRequestMetrics() {
    try {
        const response = await fetch('http://localhost:8080/failedRequests');
        if (response.ok) {
            const metrics = await response.json();
            document.getElementById('totalFailedRequests').innerText = metrics.totalFailedRequests;
            // Add logic to display other metrics
        }
    } catch (error) {
        console.error("Error fetching failed request metrics:", error);
    }
}

fetchFailedRequestMetrics();

