"""Quick bcrypt test"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Test password
password = "Admin123!"
hashed = pwd_context.hash(password)

print(f"Original: {password}")
print(f"Hashed: {hashed}")
print(f"Verify correct: {pwd_context.verify(password, hashed)}")
print(f"Verify wrong: {pwd_context.verify('WrongPass123!', hashed)}")
