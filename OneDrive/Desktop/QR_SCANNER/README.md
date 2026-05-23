# 📱 QR Code Scanner

A modern web application for scanning QR codes with your camera and storing the data securely. Built with Flask backend and responsive HTML/CSS/JavaScript frontend.

## ✨ Features

- **Real-time QR Scanning** - Uses your device camera with instant detection
- **Modern UI** - Beautiful, responsive interface with dark/light support
- **Secure Storage** - Data stored locally in SQLite database
- **History Tracking** - View all scans with timestamps
- **Easy Management** - Copy and delete scan records
- **Mobile Ready** - Works seamlessly on desktop, tablet, and mobile devices
- **Database Viewer** - Dedicated page to view and manage all scanned data

## 📁 Project Structure

```
QR_SCANNER/
├── backend/
│   ├── main.py              # Flask server with REST API
│   └── requirement.txt       # Python dependencies
├── frontend/
│   ├── index.html           # Main scanner page
│   ├── viewer.html          # Database viewer page
│   ├── script.js            # JavaScript logic
│   └── style.css            # Styling
└── .gitignore               # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites
- Python 3.14+
- Virtual environment (already set up in `.venv`)

### Installation

1. **Install Backend Dependencies**
```bash
cd backend
python -m pip install -r requirement.txt
```

2. **Start Backend Server**
```bash
python main.py
```
Server runs on `http://localhost:8000`

3. **Open Frontend**
Open `frontend/index.html` in your browser

## 📖 Usage

### Scanning QR Codes
1. Click the **"📷 Open Scanner"** button
2. Allow camera access when prompted
3. Point camera at QR code
4. Data is automatically saved and displayed

### Viewing Data
- **Dashboard** - See recent scans on the home page
- **Database Viewer** - Click "Database" button for complete list
- **API** - Access JSON data at `http://localhost:8000/scans`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server status |
| POST | `/scan` | Save new QR scan |
| GET | `/scans` | Get all scans |
| GET | `/scan/<id>` | Get specific scan |
| DELETE | `/scan/<id>` | Delete scan |

### Example POST Request
```json
{
  "data": "https://example.com"
}
```

## 🎨 UI Features

- **Sticky Navigation** - Easy access to database viewer
- **Hero Section** - Prominent scanner button
- **Features Showcase** - Highlights key benefits
- **Modal Scanner** - Focused scanning experience
- **Responsive Design** - Works on all devices
- **Smooth Animations** - Professional hover effects and transitions

## 📊 Database

- **Type**: SQLite
- **Location**: `backend/qr_data.db`
- **Auto-created** on first run
- **Stores**: ID, QR data, timestamp

## 🛠️ Technologies Used

- **Backend**: Flask, Flask-CORS
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: SQLite3
- **QR Detection**: jsQR library
- **API**: REST with JSON

## 📝 Notes

- The database file is created automatically
- Camera access requires HTTPS or localhost
- All data is stored locally on your machine
- No data is sent to external servers

## 📄 License

Open source project

## 👨‍💻 Author

Created by Vansh

---

**Ready to scan?** 📷 Open `frontend/index.html` and start scanning QR codes!
