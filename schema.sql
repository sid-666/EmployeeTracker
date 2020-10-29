DROP DATABASE IF EXISTS employee_tracker_DB;
CREATE database employee_tracker_DB;

USE employee_tracker_DB;

CREATE TABLE employees (
  id INT NOT NULL AUTO INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INT NOT NULL AUTO INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(65,30) NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE departments (
  id INT NOT NULL AUTO INCREMENT,
  name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);