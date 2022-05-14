// require mysql, inquirer, and console.table dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// create connection with mysql
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '$p@ghEtt1M0n$ter',
    database: 'tracker_db'
  },
  console.log(`Connected to the tracker_db database.`)
);

// initial prompt to ask the user what they would like to do
const initialPrompt = () =>
  inquirer
    .prompt([
        {
            type: 'list',
            name: 'menu',
            message: 'What would you like to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add a Department',
                'Add a Role',
                'Add an Employee',
                'Update an Employee Role',
                'Exit',
            ],
        },
    ])
    .then(response => {
        switch (response.menu) {
            case 'View All Departments':
                viewDepartments();
                break;
            case 'View All Roles':
                viewRoles();
                break;
            case 'View All Employees':
                viewEmployees();
                break;
            case 'Add a Department':
                addDepartment();
                break;
            case 'Add a Role':
                addRole();
                break;
            case 'Add an Employee':
                addEmployee();
                break;
            case 'Update an Employee':
                updateEmployee();
                break;
            case 'Exit':
                db.end();
                break;
        }
    });

    // View all departments functionality
    const viewDepartments = () => db.query(`SELECT * FROM department`, (err, results) => {
        if (err) {
            console.error(err)
        } else {
            console.table(results)
        }
        initialPrompt();
    });

    // View all roles function
    const viewRoles = () => db.query(
        `
        SELECT 
            roles.id,
            roles.title AS 'Title',
            roles.salary AS 'Salary',
            department.name AS 'Department'
        FROM roles
        LEFT JOIN department ON roles.department_id = department.id
        `, (err, results) => {
            if (err) {
                console.error(err)
            } else {
                console.table(results)
            }
            initialPrompt();
    });
    
    // View all employees function
    const viewEmployees = () => db.query(
        `
        SELECT
            employee.id AS 'ID',
            employee.first_name AS 'First Name',
            employee.last_name AS 'Last Name',
            roles.title AS 'Title',
            department.name AS 'Department',
            roles.salary AS 'Salary',
            concat(manager.first_name, ' ' , manager.last_name) AS manager
            FROM employee
            JOIN roles ON employee.role_id = roles.id
            LEFT JOIN department ON roles.department_id = department.id
            LEFT JOIN employee manager ON employee.manager_id = manager.id
        `, (err, results) => {
            if (err) {
                console.error(err);
            } else {
                console.table(results);
            }
            initialPrompt();
    });