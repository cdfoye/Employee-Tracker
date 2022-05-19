-- seed values for departments
INSERT INTO department (name)
VALUES ("HR"),
       ("IT"),
       ("Marketing"),
       ("Web Development");

-- seed values for roles
INSERT INTO roles (title, salary, department_id)
VALUES ("HR Manager", 80000, 1),
       ("Junior Web Developer", 85000, 4),
       ("IT Technician", 70000, 2),
       ("Social Media Specialist", 65000, 3);

-- seed values for employees
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Meridith", "Grey", 1, NULL),
       ("Darth", "Vader", 3, 1),
       ("Spongebob", "Squarepants", 4, 2),
       ("Patrick", "Star", 2, 3);
                                                                                                                                    