var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Drss@803",
    database: "employee_tracker_DB"
});
connection.connect(function (err) {
    if (err) throw err;
    runInterface();
});

function runInterface() {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices: [
                "View department, roles and employees",
                "View Employees by Managers",
                "Combined salaries of all employees in that department",
                "Add department, roles and employees",
                "Update employee roles",
                "Update employee managers",
                "Delete department, roles and employees"
            ]
        })
        .then(function (answer) {
            switch (answer.action) {
                case "View department, roles and employees":
                    viewDRE();
                    break;

                case "View Employees by Managers":
                    viewEmpbyMan();
                    break;

                case "Combined salaries of all employees in that department":
                    utilBudget();
                    break;

                case "Add department, roles and employees":
                    addDepRolEmp();
                    break;

                case "Update employee roles":
                    updateRoles();
                    break;

                case "Update employee managers":
                    updateManagers();
                    break;

                case "Delete department, roles and employees":
                    deleteDepRolEmp();
                    break;
            }
        });
}

function viewDRE() {
    var query = "select employee.id, employee.first_name, employee.last_name, department.name, role.title, role.salary" 
    + "from employee inner join (role inner join department on role.department_id = department.id) on employee.role_id = role.id"
    +";";
    connection.query(query, function(err, res){
        if(err)throw err;
        console.table(res);
    })
}

function viewEmpbyMan(){
    var query = "SELECT CONCAT(m.first_name, ' ', m.last_name) as managers from employees e INNER JOIN employees m ON m.managers_id = e.id"
    connection.query(query, function(err, res){
        inquirer.prompt({
            name: "manager",
            type: "rawlist",
            message: "Who is the manager?",
            choices: function(){
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                  choiceArray.push(res[i].managers);
                }
                return choiceArray;
            }
        }).then(function(answer){
            var query = "select concat(e.first_name, ' ',e.last_name) as normalemployee CONCAT(m.first_name, ' ', m.last_name) as manager from employee e INNER JOIN employees m on e.id = m.managers_id where ?"
            connection.query(query, {manager: answer.manager}, function(err, res){
                if(err)throw err;
                console.table(res)
            })
        })
    })
}

function utilBudget(){
    var query = "SELECT name FROM department";
    connection.query(query, function(err, res){
        inquirer.prompt({
            name: "department",
            type: "rawlist",
            message: "Which department's budget do you want to check?",
            choices: function(){
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                  choiceArray.push(res[i].name);
                }
                return choiceArray;
            }
        }).then(function(answer){
            var query = "SELECT SUM(role.salary) FROM employee inner join (role INNER JOIN department ON role.department_id = department.id) ON employee.role_id = role.id WHERE ?"
            +";";
            connection.query(query, {department:{name: answer.department}}, function(err,res){
                if(err)throw err;
                console.table(res)
            })
        })
    })
}

function addDepRolEmp(){
    inquirer.prompt({
        name: "add",
        type: "rawlist",
        message: "Which field do you want to add data in?",
        choices: ["department", "roles", "employee"]
    }).then(function(answer){
        switch (answer.add) {
            case "department":
                addDepartment();
                break;

            case "roles":
                addRoles();
                break;

            case "employee":
                addEmployee();
                break;
        }
    })
}
function addDepartment(){
    inquirer.prompt({
        name: "add_dep",
        type: "input",
        message: "What is the department name?",
    }).then(function(answer){
        var query = "INSERT INTO department (name) VALUES (?)"
        connection.query(query, {name: answer.add_dep}, function(err){
            if (err) throw err;
            console.log("Succesfully inserted")
        })
    })
}
function addRoles(){
    var questions = [
        {
            name: "add_role_title",
            type: "input",
            message: "What is the role name?"
        },
        {
            name: "add_role_salary",
            type: "input",
            message: "What is the salary for this role?"
        },
        {
            name: "add_role_depid",
            type: "rawlist",
            message: "What department_id is associated with this role?",
            choices: function(){
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                  choiceArray.push(res[i].id);
                }
                return choiceArray;
            }
        },
    ]
    connection.query("SELECT id FROM department", function(err, res){
        inquirer.prompt(questions).then(function(answer){
            var query = "INSERT INTO roles (title, salary, department_id) VALUES (?)"
            connection.query(query, 
                {name: answer.add_role_title,
                 salary: answer.add_role_salary, 
                 department_id: answer.add_role_depid
                }, 
                function(err){
                if (err) throw err;
                console.log("Succesfully inserted")
            })
        })
    })
}
function addEmployee(){
    var questions = [
        {
            name: "add_employee_Fname",
            type: "input",
            message: "What is the employee's first name?"
        },
        {
            name: "add_employee_Lname",
            type: "input",
            message: "What is the employee's last name?"
        },
        {
            name: "add_employee_roleid",
            type: "rawlist",
            message: "What role_id is associated with this employee?",
            choices: function(){
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                  choiceArray.push(res[i].id);
                }
                return choiceArray;
            }
        },
        {
            name: "add_employee_managerid",
            type: "input",
            message: "What is this employees managers manager_id?"
        }
    ]
    connection.query("SELECT id FROM roles", function(err, res){
        inquirer.prompt(questions).then(function(answer){
            var query = "INSERT INTO roles (title, salary, department_id) VALUES (?)"
            connection.query(query, 
                {first_name: answer.add_employee_Fname,
                 last_name: answer.add_employee_Lname, 
                 role_id: answer.add_employee_roleid,
                 manager_id: answer.add_employee_managerid
                }, 
                function(err){
                if (err) throw err;
                console.log("Succesfully inserted")
            })
        })
    })
}

