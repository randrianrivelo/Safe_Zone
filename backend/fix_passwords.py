import bcrypt

password = b"Admin2035!"
hashed   = bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))
print(hashed.decode())