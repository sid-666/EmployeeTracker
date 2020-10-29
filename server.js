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
    database: "employee_tracker_DB",
    multipleStatements: true
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
    var query = "select employees.id, employees.first_name, employees.last_name, departments.name, roles.title, roles.salary" 
    + "from employees inner join (roles inner join departments on roles.department_id = departments.id) on employees.role_id = roles.id"
    +";";
    connection.query(query, function(err, res){
        if(err)throw err;
        console.table(res);
        runInterface()
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
                  choiceArray.push(res[i].manager);
                }
                return choiceArray;
            }
        }).then(function(answer){
            var query = "select concat(e.first_name, ' ',e.last_name) as normalemployee CONCAT(m.first_name, ' ', m.last_name) as manager from employees e INNER JOIN employees m on e.id = m.manager_id where ?"
            connection.query(query, {manager: answer.manager}, function(err, res){
                if(err)throw err;
                console.table(res)
                runInterface()
            })
        })
    })
}

function utilBudget(){
    var query = "SELECT name FROM departments";
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
            var query = "SELECT SUM(role.salary) FROM employees inner join (roles INNER JOIN departments ON roles.department_id = departments.id) ON employees.role_id = roles.id WHERE ?"
            +";";
            connection.query(query, {departments:{name: answer.department}}, function(err,res){
                if(err)throw err;
                console.table(res)
                runInterface()
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
        var query = "INSERT INTO departments (name) VALUES (?)"
        connection.query(query, {name: answer.add_dep}, function(err){
            if (err) throw err;
            console.log("Succesfully inserted")
            runInterface()
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
    connection.query("SELECT id FROM departments", function(err, res){
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
                runInterface()
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
            var query = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?)"
            connection.query(query, 
                {first_name: answer.add_employee_Fname,
                 last_name: answer.add_employee_Lname, 
                 role_id: answer.add_employee_roleid,
                 manager_id: answer.add_employee_managerid
                }, 
                function(err){
                if (err) throw err;
                console.log("Succesfully inserted")
                runInterface()
            })
        })
    })
}

function updateRoles(){
    connection.query("SELECT title FROM roles; SELECT id FROM employees", function(err,res){
        if(err) throw err;
        var questions = [
            {
                name: "update_employee",
                type: "rawlist",
                message: "Which employees role do you want to change?",
                choice: function(){
                    let response = res[1];
                    var choiceArray = []
                    for (var i = 0; i < response.length; i++) {
                        choiceArray.push(response[i].id);
                      }
                      return choiceArray;
                }
            },
            {
                name: "update_emprole",
                type: "rawlist",
                message: "What role do you wnat to change to?",
                choice: function(){
                    let response = res[0];
                    var choiceArray = []
                    for (var i = 0; i < response.length; i++) {
                        choiceArray.push(response[i].name);
                      }
                      return choiceArray;
                }
            }

        ]
        inquirer.prompt(questions).then(function(answer){
            var question = "SELECT id FROM roles WHERE ?";
            connection.query(question, {title: answer.update_emprole}, function(err, res){
                if(err) throw err;
                connection.query("UPDATE employees SET ? WHERE ?", [{role_id: res.id}, {id: answer.update_employee}],function(err){
                    if(err) throw err;
                    console.log("update succesful!!")
                    runInterface()
                })
            })
        })
    })
}

function updateManagers(){
    connection.query("SELECT id FROM employees", function(err,res){
        if(err) throw err;
        var questions = [
            {
                name: "update_employee",
                type: "rawlist",
                message: "Which employees manager do you want to change?",
                choice: function(){
                    var choiceArray = []
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].id);
                      }
                      return choiceArray;
                }
            },
            {
                name: "update_empman",
                type: "rawlist",
                message: "What manager do you wnat to change to?",
                choice: function(){
                    var choiceArray = []
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].name);
                      }
                      return choiceArray;
                }
            }

        ]
        inquirer.prompt(questions).then(function(answer){
            connection.query("UPDATE employees SET ? WHERE ?", [{manager_id: answer.update_empman}, {id: answer.update_employee}],function(err){
                if(err) throw err;
                console.log("update succesful!!")
                runInterface()
            })
        })
    })
}

function deleteDepRolEmp(){
    inquirer.prompt({
        name: "delete",
        type: "rawlist",
        message: "Which field do you want to delete data from?",
        choices: ["department", "roles", "employee"]
    }).then(function(answer){
        switch (answer.add) {
            case "department":
                delDepartment();
                break;

            case "roles":
                delRoles();
                break;

            case "employee":
                delEmployee();
                break;
        }
    })
}
function delDepartment(){
    inquirer.prompt({
        name: "del_dep",
        type: "input",
        message: "What is the department name?",
    }).then(function(answer){
        var query = "DELETE FROM departments WHERE ?"
        connection.query(query, {name: answer.del_dep}, function(err){
            if (err) throw err;
            console.log("Succesfully deleted")
            runInterface()
        })
    })
}

function delRoles(){
    var questions = [
        {
            name: "del_role_title",
            type: "input",
            message: "What is the role name?"
        },
    ]

    inquirer.prompt(questions).then(function(answer){
        var query = "DELETE FROM roles WHERE ?"
        connection.query(query, 
            {name: answer.del_role_title}, 
            function(err){
            if (err) throw err;
            console.log("Succesfully deleted")
            runInterface()
        })
    })
}

function delEmployee(){
    var questions = [
        {
            name: "del_employee",
            type: "rawlist",
            message: "What is the employee's employee id?",
            choices: function(){
                var choiceArray = [];
                for (var i = 0; i < res.length; i++) {
                  choiceArray.push(res[i].id);
                }
                return choiceArray;
            }
        }
    ]
    connection.query("SELECT id FROM employees", function(err, res){
        inquirer.prompt(questions).then(function(answer){
            var query = "DELETE FROM employees WHERE?"
            connection.query(query, 
                { 
                 id: answer.del_employee
                }, 
                function(err){
                if (err) throw err;
                console.log("Succesfully deleted")
                runInterface()
            })
        })
    })
}
