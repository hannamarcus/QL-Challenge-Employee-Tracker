const mysql = require('mysql2/promise');
const inquirer = require("inquirer");
require("console.table");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'employee_db'
});

connection.connect(err => console.log(err));

// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee rolefunction mainMenu()

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'userChoice',
            message: 'What would you like to do? (use arrow keys)',
            choices: [
                'View all Departments',
                'View all Roles',
                'View all Employees',
                'Add Department',
                'Add Role',
                'Add Employee',
                'Update Employee',
                'Quit'
            ]
        }]).then((res) => {
            console.log(res.userChoice);
            switch (res.userChoice) {
                case 'View all Departments':
                    departmentList();
                    break;
                case 'View all Roles':
                    roleList();
                    break;
                case 'View all Employees':
                    employeeList();
                    break;
                case 'Add Department':
                    newDepartment();
                    break;
                case 'Add Role':
                    addRole();
                    break;
                case 'Add Employee':
                    addEmployee();
                    break;
                case 'Update Employee Role':
                    updateEmp();
                    break;
                case 'Quit':
                    connection.end();
                    break;
            }
        })
};

//WHEN I choose to view all departments
//THEN I am presented with a formatted table showing department names and department ids

function departmentList() {
    connection.query(`SELECT id, name FROM department`, (err, data) => {
        if (err) throw err;
        console.table(data),
            mainMenu();
    })
}

// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role

function roleList() {

    let query = `SELECT 
    role.title, 
    role.id, 
    role.salary, 
    department.name AS department
    FROM role
    JOIN department 
    ON department.id = role.department_id`

    connection.query(query, (err, data) => {
        if (err) throw err;
        console.table(data),
            mainMenu();
    })
}

// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to

function employeeList() {

    let query = `SELECT 
    employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS department, 
    role.salary, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role
    ON employee.role_id = role.id
    LEFT JOIN department
    ON department.id = role.department_id
    LEFT JOIN employee manager
    ON manager.id = employee.manager_id`

    connection.query(query, (err, data) => {
        if (err) throw err;

        console.table(data),

            mainMenu();
    })
}


// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database

function newDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Add Department:"
            }
        ]).then((data) => {
            connection.query(`INSERT INTO department SET ?`, { name: data.name }, (err, data) => {
                if (err) throw err;
                console.table(data),
                    mainMenu();
            })
        })
};

// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database

function addRole() {

    connection.query(`SELECT id, name FROM department`, (err, data) => {
        if (err) throw err;
        const department = data.map(({ id, name }) => ({
            value: id,
            name: `${id} ${name}`
        }));

        addRoleNew(department);
    })
};

function addRoleNew(department) {
    inquirer
        .prompt([
            {
                type: "input",
                name: "title",
                message: "Role name?"
            },
            {
                type: "input",
                name: "salary",
                message: "Salary for Role? "
            },
            {
                type: "list",
                name: "department",
                message: "Department: ",
                choices: department
            },
        ]).then((data) => {
            connection.query(`INSERT INTO role SET ?`, {
                title: data.title,
                salary: data.salary,
                department_id: data.department
            }, (err, data) => {
                if (err) throw err;
                console.table(data),
                    mainMenu();
            })
        })
};

// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database

function addEmployee() {
    connection.query(`SELECT id, title FROM role`, (err, data) => {
        if (err) throw err;
        const role = data.map(({ id, title }) => ({
            value: id,
            name: `${title}`,

        }));

        connection.query(`SELECT id, first_name FROM employee`, (err, data) => {
            if (err) throw err;
            const manager = data.map(({ first_name, id }) => ({
                name: `${first_name}`,
                value: id,

            }));

            addEmployeeNew(role, manager);
        });

        function addEmployeeNew(role, manager) {
            inquirer
                .prompt([
                    {
                        type: "input",
                        name: "first_name",
                        message: "Enter employee's first name"
                    },
                    {
                        type: "input",
                        name: "last_name",
                        message: "Enter employee's last name"
                    },
                    {
                        type: "list",
                        name: "title",
                        message: "Enter employee's Role",
                        choices: role
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Enter employee's Manager",
                        choices: manager
                    },
                ]).then((data) => {
                    connection.query(`INSERT INTO employee SET ?`, { role_id: data.title, first_name: data.first_name, last_name: data.last_name, manager_id: data.manager }, (err, data) => {
                        if (err) throw err;
                        console.table(data),
                            mainMenu();
                    })
                })
        }
    })
};

// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database

function updateEmployee() {

    connection.query(`SELECT employee.id, employee.first_name, employee.last_name FROM employee`, (err, data) => {
        if (err) throw err;
        const employee = data.map(({ id, first_name, last_name }) => ({
            value: id,
            name: `${first_name} ${last_name}`
        }));
        console.table(data);
        updateRole(employee);
    });
}

function updateRole(employee) {

    connection.query(`SELECT role.id, role.title, role.salary FROM role`, (err, data) => {
        if (err) throw err;
        let roleChoice
            = data.map(({ id, title }) => ({
                value: id,
                name: `${title}`
            }));
        console.table(data);
        getUpdatedRole(employee, roleChoice
        );
    });
}

function getUpdatedRole(employee, roleChoice
) {
    inquirer
        .prompt([
            {
                type: "list",
                name: "employee",
                message: `Choose Employee to Update:`,
                choices: employee
            },
            {
                type: "list",
                name: "role",
                message: "Select New Role: ",
                choices: roleChoice

            },

        ]).then((data) => {
            connection.query(`UPDATE employee SET role_id = ? WHERE id = ?`, [data.role, data.employee], (err, data) => {
                if (err) throw err;
                mainMenu();
            });
        });
}

mainMenu();