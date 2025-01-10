const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "MySQL@9616",
  database: "employees_db",
});

const execute = async (query, bindValuesArray) => {
  
  let connection;
  

  try {
    connection = await pool.getConnection();
    const [results] = await connection.query(query, bindValuesArray);
    return results;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
app.post('/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;
    let query = 'insert into employees (firstName, lastName, email, phone, address) value (?, ?, ?, ?, ?)'
    const result = await execute(query,[firstName, lastName, email, phone, address]);

    res.status(201).send({ message: 'Employee added successfully', employeeId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: 'Error saving employee', error });
  }
});
app.get('/getEmp', async (req, res) => {
  try {
    const query = 'select * from employees';
    const result = await execute(query);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: 'Error fetching employees', error });
  }
});

app.get('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'select * from employees where id = ?';
    const result = await execute(query, [id]);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: 'Error fetching employee', error });
  }
});

app.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address } = req.body;
    const query = 'update employees set firstName = ?, lastName = ?, email = ?, phone = ?, address = ? where id = ?';
    await execute(query, [firstName, lastName, email, phone, address, id]);
    res.status(200).send({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: 'Error updating employee', error });
  }
});

app.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'delete from employees where id = ?';
    await execute(query, [id]);
    res.status(200).send({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: 'Error deleting employee', error });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("hello World");
});
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

