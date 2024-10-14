  --Assignment task 1

--1

INSERT INTO account
    (account_firstname, account_lastname, account_email, account_password)
VALUES
('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

--2

UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;

--3

DELETE FROM account
WHERE account_id = 1;

DELETE FROM account
WHERE account_id IN (9,10,11,12,13);

--5
SELECT classification_name, inv_make, inv_model
FROM public.inventory INNER JOIN public.classification ON inventory.classification_id= classification.classification_id
WHERE classification_name = 'Sport';

--4

UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior');


--6
UPDATE inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, 'images/', 'images/vehicles/'),
	inv_image = REPLACE(inv_image, 'images/', 'images/vehicles/');

--video https://www.youtube.com/watch?v=QHBuqwXIIAs

-- Information about accounts
-- account_firstname: Basic
-- account_lastname: Client
-- account_email: basic@340.edu
-- account_password: I@mABas1cCl!3nt
-- account_firstname: Happy
-- account_lastname: Employee
-- account_email: happy@340.edu
-- account_password: I@mAnEmpl0y33
-- account_firstname: Manager
-- account_lastname: User
-- account_email: manager@340.edu
-- account_password: I@mAnAdm!n1strat0r