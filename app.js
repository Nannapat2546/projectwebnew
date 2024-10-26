const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Database configuration
const pool = new Pool({
    user: 'postgres', // เปลี่ยนเป็น username ของคุณ
    host: 'localhost',
    database: 'rollcallstudent_db',
    password: '0807780787', // เปลี่ยนเป็น password ของคุณ
    port: 5432,
});

// ตั้งค่า EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ใช้ body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// หน้าแรก
app.get('/', async (req, res) => {
    try {
        const students = await pool.query('SELECT id, prefix_id,first_name, last_name, date_of_brith,sex, curriculum_id,previous_school,address,telephone, email,line_id FROM student');
        res.render('index', { students: students.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลนักเรียน');
    }
});

// หน้าแสดง student_list
app.get('/student', async (req, res) => {
    try {
        const studentList = await pool.query(`
            SELECT sl.id, s.first_name, s.last_name, sl.active_date, sl.status
            FROM student_list sl
            JOIN student s ON sl.student_id = s.id
        `);
        res.render('student', { studentList: studentList.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูล');
    }
});


// เช็คชื่อ
app.post('/attendance', async (req, res) => {
    const { sectionId, studentId, activeDate, status } = req.body;
    try {
        await pool.query(
            'INSERT INTO student_list (section_id, student_id, active_date, status) VALUES ($1, $2, $3, $4)',
            [sectionId, studentId, activeDate, status]
        );
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการเช็คชื่อ');
    }
});


app.get('/insert', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM student'); 
        res.render('insert', { users: result.rows }); // ส่งข้อมูลไปยังไฟล์ EJS
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Server Error');
    }
});

  
  // เส้นทางสำหรับรับข้อมูลและ insert ลงฐานข้อมูล
  app.post('/student', async (req, res) => {
    const { prefix_id, first_name, last_name, date_of_brith, curriculum_id, previous_school, address, telephone, email, line_id } = req.body;
  
    try {
        await pool.query(`
            INSERT INTO student 
            (prefix_id, first_name, last_name, date_of_birth, curriculum_id, previous_school, address, telephone, email, line_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, 
        [prefix_id, first_name, last_name, date_of_birth, curriculum_id, previous_school, address, telephone, email, line_id]);
        
        res.redirect('insert'); // กลับไปที่หน้าฟอร์มหลังจากบันทึกข้อมูลเสร็จสิ้น
    } catch (error) {

  
    // สร้าง SQL Query สำหรับการ insert ข้อมูล
    const query = 
  'INSERT INTO student (id, prefix_id, first_name, last_name, date_of_brith, curriculum_id, previous_school, address, telephone, email, line_id)'
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);

  //ลบ
  app.post('/delete-student', async (req, res) => {
    const { studentId } = req.body;
    try {
        await pool.query('DELETE FROM student WHERE id = $1', [studentId]);
        res.redirect('/delete-student'); // Redirect to the student list after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน');
    }
});

  
    try {
      // รันคำสั่ง SQL
      await pool.query(query, [
        id, prefix_id, first_name, last_name, date_of_brith, curriculum_id,
        previous_school, address, telephone, email, line_id,
    ]);
    
      res.send('Insert successful');
    } catch (err) {
      console.error('Error inserting student:', err);
      res.status(500).send('Error inserting student');
    }
}

// รันเซิร์ฟเวอร์
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
});
