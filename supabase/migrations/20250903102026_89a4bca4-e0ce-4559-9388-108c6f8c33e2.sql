-- Corriger le rôle de l'utilisateur admin
UPDATE user_roles 
SET role = 'admin'::app_role 
WHERE user_id = '30c6336c-3341-457a-bc1a-225d13052fde';