from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, func, Text
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class CategoryEnum(str, enum.Enum):
    food = "food"
    transport = "transport"
    housing = "housing"
    entertainment = "entertainment"
    healthcare = "healthcare"
    shopping = "shopping"
    education = "education"
    utilities = "utilities"
    travel = "travel"
    other = "other"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    expenses = relationship("Expense", back_populates="category_rel")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="expenses")
    category_rel = relationship("Category", back_populates="expenses")
