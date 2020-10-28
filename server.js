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