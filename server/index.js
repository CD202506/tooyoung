const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'data.json');             // 評量紀錄
const COMMENTS_FILE = path.join(__dirname, 'comments.json');     // 留言紀錄
const PATIENTS_FILE = path.join(__dirname, 'patients.json');     // 病患主檔

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== 評量紀錄 API（與之前相同） =====
app.get('/api/records', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') return res.json([]);
        if (err) return res.status(500).json({ error: '讀取資料失敗' });
        try { res.json(JSON.parse(data || '[]')); }
        catch { res.status(500).json({ error: '資料解析錯誤' }); }
    });
});

app.post('/api/records', (req, res) => {
    const record = req.body;
    record.createdAt = new Date().toISOString();
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let records = [];
        if (!err && data) try { records = JSON.parse(data); } catch {}
        records.push(record);
        fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), err => {
            if (err) return res.status(500).json({ error: '寫入資料失敗' });
            res.status(201).json(record);
        });
    });
});

// ===== 留言 API =====
app.get('/api/comments', (req, res) => {
    const { patient_id } = req.query;
    fs.readFile(COMMENTS_FILE, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') return res.json([]);
        if (err) return res.status(500).json({ error: '讀取留言失敗' });
        let comments = [];
        try { comments = JSON.parse(data || '[]'); } catch {}
        if (patient_id) comments = comments.filter(c => c.patient_id === patient_id);
        res.json(comments);
    });
});

app.post('/api/comments', (req, res) => {
    const comment = req.body;
    comment.createdAt = new Date().toISOString();
    fs.readFile(COMMENTS_FILE, 'utf8', (err, data) => {
        let comments = [];
        if (!err && data) try { comments = JSON.parse(data); } catch {}
        comments.push(comment);
        fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2), err => {
            if (err) return res.status(500).json({ error: '寫入留言失敗' });
            res.status(201).json(comment);
        });
    });
});

// ===== 病患主檔 API =====
// 取得所有病患
app.get('/api/patients', (req, res) => {
    fs.readFile(PATIENTS_FILE, 'utf8', (err, data) => {
        if (err && err.code === 'ENOENT') return res.json([]);
        if (err) return res.status(500).json({ error: '讀取病患失敗' });
        let patients = [];
        try { patients = JSON.parse(data || '[]'); } catch {}
        res.json(patients);
    });
});

// 新增一筆病患
app.post('/api/patients', (req, res) => {
    const patient = req.body;
    if (!patient.id) patient.id = 'p' + Math.random().toString(36).slice(2, 8);
    fs.readFile(PATIENTS_FILE, 'utf8', (err, data) => {
        let patients = [];
        if (!err && data) try { patients = JSON.parse(data); } catch {}
        patients.push(patient);
        fs.writeFile(PATIENTS_FILE, JSON.stringify(patients, null, 2), err => {
            if (err) return res.status(500).json({ error: '寫入病患失敗' });
            res.status(201).json(patient);
        });
    });
});

// 導向首頁
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
