// require mysql, inquirer, and console.table dependencies
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const { response } = require('express');

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
            case 'Update an Employee Role':
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

// Add a department function
const addDepartment = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'deptName',
                message: 'What department do you want to add?',
            }
        ])
        .then((response) => {
            db.query(`INSERT INTO department (name) VALUES (?)`, response.deptName, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`${response.deptName} was successfully added.`)
                }
            })
            initialPrompt();
        })
};

// Department array to get list of departments for adding a role
let deptArray = [];
const departmentSelect = () => {
    db.query(`SELECT * FROM department`, (err, res) => {
        if (err) {
            console.error(err);
        }
        // for loop to add new departments to the department array
        for (let i = 0; res.length; i++) {
            deptArray.push(res[i].name);
        }
    })
    return deptArray;
};

// Add a role function
const addRole = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What role do you want to add?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the employee salary for this role?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'What department will this role be under?',
                choices: departmentSelect()
            }
        ])
        .then((response) => {
            let department_id;
            db.query(`SELECT (id) FROM department WHERE name = ?`, response.department, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    department_id = res[0].id;
                }

                db.query(`INSERT INTO roles SET ?`, {title: response.title, salary: response.salary, department_id: department_id}, (err, res) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.table(response);
                        console.log('New role successfully added!');
                    }
                    initialPrompt();
                })
            })
        })
};

// Role array to get list of roles for adding an employee or updating an employee
let roleArray = [];
const roleSelect = () => {
    db.query(`SELECT * FROM roles`, (err, res) => {
        if (err) {
            console.error(err);
        }
        // for loop to add new roles to the role array
        for (let i = 0; res.length; i++) {
            roleArray.push(res[i].title);
        }
    })
    return roleArray;
};

// Manager array to get list of managers for adding an employee
let managerArray = [];
const managerSelect = () => {
    db.query(`SELECT first_name, last_name FROM employee`, (err, res) => {
        if (err) {
            console.error(err);
        }
        // for loop to add new managers to the managers array
        for (let i = 0; res.length; i++) {
            managerArray.push(`${res[i].first_name} ${res[i].last_name}`);
        }
    })
    return managerArray;
};

// Add an employee function
const addEmployee = () => {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Enter employees first name: '
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'Enter employees last name: '
            },
            {
                type: 'list',
                name: 'role',
                message: 'What is the employees title?',
                choices: roleSelect()
            },
            {
                type: 'list',
                name: 'manager',
                message: 'Who is the employees manager?',
                choices: managerSelect()
            }
        ]).then((response) => {
            let roleID;
            let managerID;
            let managerName = response.manager.split(' ');

            db.query(`SELECT (id) FROM roles WHERE title = ?`, response.role, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    roleID = result[0].id
                }

                db.query(`SELECT (id) FROM employee WHERE first_name = ? AND last_name = ?`, [managerName[0], managerName[1]], (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        managerID = result[0].id
                        addtoTeam();
                    }
                })

                const addtoTeam = () => {

                    db.query(`INSERT INTO employee SET ?`, {first_name: response.firstName, last_name: response.lastName, role_id: roleID, manager_id: managerID}, (err, res) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.table(response);
                            console.log('New role successfully added!');
                        }
                        initialPrompt();
                    })
                }
            })
        })
};

// Employee array to get list of employees for updating an employee
let employeeArray = [];
const employeeSelect = () => {
    db.query(`SELECT * FROM employee`, (err, res) => {
        if (err) {
            console.error(err);
        }
        // for loop to add new managers to the managers array
        for (let i = 0; res.length; i++) {
            employeeArray.push(`${res[i].first_name} ${res[i].last_name}`);
        }
    })
    return employeeArray;
};

// Update an employee role function
const updateEmployee = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Select an employee to update: ',
                choices: employeeSelect()
            },
            {
                type: 'list',
                name: 'role',
                message: 'Select the employees new role: ',
                choices: roleSelect()
            }
        ]).then((response) => {
            let roleID;
            let employeeName = response.employee.split(' ');

            db.query(`SELECT (id) FROM roles WHERE title = ?`, response.role, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    roleID = res[0].id
                }
                updateE()
            })

            const updateE = () => {
                db.query(`UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`, {role_id: roleID, first_name: employeeName[0], last_name: employeeName[1]}, (err, res) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.table(response);
                        console.log('Employee updated successfully!');
                    }
                    initialPrompt();
                })
            }
        })
}