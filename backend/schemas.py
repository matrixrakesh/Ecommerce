from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float = Field(..., ge=0, description="Price must be non-negative")
    quantity: int = Field(..., ge=0, description="Quantity cannot be negative")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    quantity: Optional[int] = Field(None, ge=0)

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Customer Schemas
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True

# Order Item Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Order quantity must be at least 1")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    price_at_time: float

    class Config:
        from_attributes = True

# Order Schemas
class OrderBase(BaseModel):
    customer_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class Order(OrderBase):
    id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItem] = []

    class Config:
        from_attributes = True
