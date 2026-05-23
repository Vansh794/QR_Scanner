const BACKEND_URL = "http://localhost:8000";

// DOM Elements
const scanBtn = document.getElementById("scanBtn");
const scannerModal = document.getElementById("scannerModal");
const closeModal = document.getElementById("closeModal");

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultDiv = document.getElementById("result");
const resultData = document.getElementById("resultData");
const resultTime = document.getElementById("resultTime");
const copyBtn = document.getElementById("copyBtn");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");
const recentList = document.getElementById("recentList");

let stream = null;
let scanning = false;
let lastScannedData = null;

// Modal Management
scanBtn.addEventListener("click", () => {
    scannerModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    scannerModal.classList.add("hidden");
    stopCamera();
});

scannerModal.addEventListener("click", (e) => {
    if (e.target === scannerModal) {
        scannerModal.classList.add("hidden");
        stopCamera();
    }
});

// Camera controls
startBtn.addEventListener("click", startCamera);
stopBtn.addEventListener("click", stopCamera);
copyBtn.addEventListener("click", copyToClipboard);

// Load recent scans on page load
window.addEventListener("load", loadRecentScans);

// Start camera function
async function startCamera() {
    try {
        hideError();
        hideResult();
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        
        video.srcObject = stream;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        scanning = true;
        
        setTimeout(scanQRCode, 500);
    } catch (err) {
        showError("Camera access denied or not available: " + err.message);
    }
}

// Stop camera function
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    
    video.srcObject = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    scanning = false;
    hideResult();
}

// Scan QR code function
function scanQRCode() {
    if (!scanning) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width > 0 && canvas.height > 0) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
            handleScannedData(code.data);
            return;
        }
    }

    requestAnimationFrame(scanQRCode);
}

// Handle scanned data
async function handleScannedData(data) {
    lastScannedData = data;
    scanning = false;
    stopBtn.disabled = false;

    showLoading();

    try {
        const response = await fetch(`${BACKEND_URL}/scan`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: data })
        });

        if (!response.ok) {
            throw new Error("Failed to save scan");
        }

        hideLoading();
        showResult(data);
        loadRecentScans();
        stopCamera();
    } catch (err) {
        hideLoading();
        showError("Error saving scan: " + err.message);
    }
}

// Show result
function showResult(data) {
    resultData.textContent = data;
    resultTime.textContent = new Date().toLocaleString();
    resultDiv.classList.remove("hidden");
}

// Hide result
function hideResult() {
    resultDiv.classList.add("hidden");
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorDiv.classList.remove("hidden");
}

// Hide error
function hideError() {
    errorDiv.classList.add("hidden");
}

// Show loading
function showLoading() {
    loadingDiv.classList.remove("hidden");
}

// Hide loading
function hideLoading() {
    loadingDiv.classList.add("hidden");
}

// Copy to clipboard
function copyToClipboard() {
    if (lastScannedData) {
        navigator.clipboard.writeText(lastScannedData).then(() => {
            alert("Copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy");
        });
    }
}

// Load recent scans
async function loadRecentScans() {
    try {
        const response = await fetch(`${BACKEND_URL}/scans`);
        if (!response.ok) throw new Error("Failed to load history");
        
        const data = await response.json();
        displayRecentScans(data.scans || []);
    } catch (err) {
        recentList.innerHTML = `<p class="no-data">Failed to load recent scans</p>`;
    }
}

// Display recent scans
function displayRecentScans(scans) {
    if (scans.length === 0) {
        recentList.innerHTML = "<p class='no-data'>No scans yet - Start scanning to see history</p>";
        return;
    }

    // Show only last 5
    const recent = scans.slice(0, 5);
    let html = "";
    
    recent.forEach(scan => {
        const scanTime = new Date(scan.scanned_at).toLocaleString();
        html += `
            <div class="scan-item">
                <div class="scan-info">
                    <p class="scan-data"><strong>📱 ${escapeHtml(scan.data)}</strong></p>
                    <p class="scan-time">⏰ ${scanTime}</p>
                </div>
            </div>
        `;
    });
    
    recentList.innerHTML = html;
}

// Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
