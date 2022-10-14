USE employee_db;

INSERT INTO department (name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 4),
("Salesperson", 80000, 4),
("Lead Engineer", 150000, 1),
("Software Engineer", 120000, 1), 
("Account Manager", 160000, 4), 
("Accountant", 125000, 2),
("Lawyer", 250000, 3); 



INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Hanna", "Marcus", 1, null),
("Maddie", "Sher", 2, 1),
("Sophia", "Landes", 2, 1),
("Zach", "Wieder", 3, null), 
("Melanie", "Libra", 4, 4),
("Jake", "Libenson", 4, 4),
("Matt", "Shack", 5, null), 
("John", "Doe", 6, 7),
("Zoe", "Smith", 6, 7),
("Lola", "James", 7, null); 