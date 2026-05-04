"""Seed script to populate demo data."""
import sys
sys.path.insert(0, ".")

from datetime import datetime, timedelta
import random
from app.database import SessionLocal
from app.models.user import User
from app.models.expense import Expense
from app.auth.password import hash_password

DEMO_EXPENSES = [
    ("Grocery Store", 92.50, "food", 0),
    ("McDonald's", 14.30, "food", 1),
    ("Starbucks Coffee", 6.75, "food", 2),
    ("Uber Ride", 18.00, "transport", 1),
    ("Metro Pass", 45.00, "transport", 5),
    ("Rent", 1500.00, "housing", 1),
    ("Electricity Bill", 95.00, "utilities", 3),
    ("Netflix", 15.99, "entertainment", 0),
    ("Spotify", 9.99, "entertainment", 10),
    ("Amazon Shopping", 67.40, "shopping", 4),
    ("Doctor Visit", 40.00, "healthcare", 7),
    ("Python Course", 29.99, "education", 12),
    ("Flight Ticket", 320.00, "travel", 15),
    ("Hotel Stay", 180.00, "travel", 15),
    ("Internet Bill", 59.99, "utilities", 2),
    ("Lunch at Thai Place", 22.00, "food", 5),
    ("Gas", 55.00, "transport", 8),
    ("Gym Membership", 40.00, "healthcare", 1),
    ("Books", 35.00, "education", 20),
    ("Clothing", 120.00, "shopping", 6),
]

db = SessionLocal()

# Create demo user
existing = db.query(User).filter(User.email == "demo@example.com").first()
if not existing:
    user = User(
        email="demo@example.com",
        username="demo",
        hashed_password=hash_password("demo123"),
        full_name="Demo User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Created demo user: demo@example.com / demo123")
else:
    user = existing
    print(f"Demo user already exists")

# Add expenses
now = datetime.utcnow()
for title, amount, category, days_ago in DEMO_EXPENSES:
    expense = Expense(
        title=title,
        amount=amount + random.uniform(-5, 5),
        category=category,
        date=now - timedelta(days=days_ago),
        user_id=user.id,
    )
    db.add(expense)

db.commit()
print(f"Added {len(DEMO_EXPENSES)} demo expenses")
db.close()
print("\nDone! Login with: demo@example.com / demo123")
