from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    description: Optional[str] = None
    category: str
    date: datetime


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None


class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    description: Optional[str]
    category: str
    date: datetime
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CategorySummary(BaseModel):
    category: str
    total: float
    count: int
    percentage: float


class MonthlyTrend(BaseModel):
    month: str
    total: float
    count: int


class ExpenseSummary(BaseModel):
    total_expenses: float
    total_count: int
    this_month: float
    last_month: float
    top_category: Optional[str]
    by_category: List[CategorySummary]
    monthly_trend: List[MonthlyTrend]
