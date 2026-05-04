from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseOut, ExpenseSummary, CategorySummary, MonthlyTrend
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/expenses", tags=["Expenses"])

CATEGORIES = ["food", "transport", "housing", "entertainment", "healthcare", "shopping", "education", "utilities", "travel", "other"]


@router.get("/categories")
def get_categories():
    return {"categories": CATEGORIES}


@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if expense_data.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose from: {CATEGORIES}")
    if expense_data.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    expense = Expense(**expense_data.model_dump(), user_id=current_user.id)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/", response_model=List[ExpenseOut])
def list_expenses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("date", regex="^(date|amount|title|created_at)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Expense).filter(Expense.user_id == current_user.id)

    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Expense.date <= datetime.combine(end_date, datetime.max.time()))
    if min_amount is not None:
        query = query.filter(Expense.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Expense.amount <= max_amount)
    if search:
        query = query.filter(Expense.title.ilike(f"%{search}%"))

    sort_col = getattr(Expense, sort_by)
    query = query.order_by(sort_col.desc() if order == "desc" else sort_col.asc())

    return query.offset(skip).limit(limit).all()


@router.get("/summary", response_model=ExpenseSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.utcnow()
    base = db.query(Expense).filter(Expense.user_id == current_user.id)

    total_expenses = base.with_entities(func.coalesce(func.sum(Expense.amount), 0)).scalar()
    total_count = base.count()

    this_month = base.filter(
        extract("month", Expense.date) == now.month,
        extract("year", Expense.date) == now.year,
    ).with_entities(func.coalesce(func.sum(Expense.amount), 0)).scalar()

    last_month_date = datetime(now.year, now.month - 1, 1) if now.month > 1 else datetime(now.year - 1, 12, 1)
    last_month = base.filter(
        extract("month", Expense.date) == last_month_date.month,
        extract("year", Expense.date) == last_month_date.year,
    ).with_entities(func.coalesce(func.sum(Expense.amount), 0)).scalar()

    category_rows = (
        base.with_entities(
            Expense.category,
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .group_by(Expense.category)
        .all()
    )

    by_category = [
        CategorySummary(
            category=row.category,
            total=round(row.total, 2),
            count=row.count,
            percentage=round((row.total / total_expenses * 100) if total_expenses > 0 else 0, 1),
        )
        for row in sorted(category_rows, key=lambda x: x.total, reverse=True)
    ]

    top_category = by_category[0].category if by_category else None

    monthly_rows = (
        base.with_entities(
            extract("year", Expense.date).label("year"),
            extract("month", Expense.date).label("month"),
            func.sum(Expense.amount).label("total"),
            func.count(Expense.id).label("count"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .limit(12)
        .all()
    )

    monthly_trend = [
        MonthlyTrend(
            month=datetime(int(row.year), int(row.month), 1).strftime("%b %Y"),
            total=round(row.total, 2),
            count=row.count,
        )
        for row in monthly_rows
    ]

    return ExpenseSummary(
        total_expenses=round(total_expenses, 2),
        total_count=total_count,
        this_month=round(this_month, 2),
        last_month=round(last_month, 2),
        top_category=top_category,
        by_category=by_category,
        monthly_trend=monthly_trend,
    )


@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_data.model_dump(exclude_unset=True)
    if "category" in update_data and update_data["category"] not in CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category")
    if "amount" in update_data and update_data["amount"] <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    for field, value in update_data.items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
