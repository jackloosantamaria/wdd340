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