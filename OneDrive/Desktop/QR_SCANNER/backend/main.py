from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE = "qr_data.db"

def init_db():
    """Initialize the database"""
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE qr_codes (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Initialize database on startup
init_db()

@app.route('/', methods=['GET'])
def read_root():
    """Root endpoint"""
    return jsonify({"message": "QR Scanner Backend is running"})

@app.route('/scan', methods=['POST'])
def save_qr_code():
    """Save scanned QR code data to database"""
    try:
        data = request.get_json()
        qr_data = data.get('data')
        
        if not qr_data:
            return jsonify({"error": "No data provided"}), 400
        
        # Create unique ID
        qr_id = str(uuid.uuid4())
        
        # Save to database
        conn = get_db()
        c = conn.cursor()
        c.execute('INSERT INTO qr_codes (id, data) VALUES (?, ?)', (qr_id, qr_data))
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "id": qr_id,
            "data": qr_data,
            "message": "QR code saved successfully"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/scans', methods=['GET'])
def get_all_scans():
    """Get all scanned QR codes"""
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM qr_codes ORDER BY scanned_at DESC')
        rows = c.fetchall()
        conn.close()
        
        scans = []
        for row in rows:
            scans.append({
                "id": row['id'],
                "data": row['data'],
                "scanned_at": row['scanned_at']
            })
        
        return jsonify({
            "total": len(scans),
            "scans": scans
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/scan/<scan_id>', methods=['GET'])
def get_scan(scan_id):
    """Get a specific scan by ID"""
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM qr_codes WHERE id = ?', (scan_id,))
        row = c.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Scan not found"}), 404
        
        return jsonify({
            "id": row['id'],
            "data": row['data'],
            "scanned_at": row['scanned_at']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/scan/<scan_id>', methods=['DELETE'])
def delete_scan(scan_id):
    """Delete a specific scan"""
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute('SELECT * FROM qr_codes WHERE id = ?', (scan_id,))
        row = c.fetchone()
        
        if not row:
            conn.close()
            return jsonify({"error": "Scan not found"}), 404
        
        c.execute('DELETE FROM qr_codes WHERE id = ?', (scan_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Scan deleted successfully",
            "id": scan_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
