from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas

# Products
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# Customers
def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Customer).offset(skip).limit(limit).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    if db_customer:
        db.delete(db_customer)
        db.commit()
    return db_customer

# Orders
def create_order(db: Session, order: schemas.OrderCreate):
    # Calculate total amount and verify inventory
    total_amount = 0.0
    for item in order.items:
        product = get_product(db, product_id=item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Product with id {item.product_id} not found")
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient inventory for product {product.name}")
        
        # Deduct inventory
        product.quantity -= item.quantity
        total_amount += product.price * item.quantity

    db_order = models.Order(
        customer_id=order.customer_id,
        total_amount=total_amount,
        status="Pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Add order items
    for item in order.items:
        product = get_product(db, product_id=item.product_id)
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_time=product.price
        )
        db.add(db_order_item)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Order).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if db_order:
        # Restore inventory
        for item in db_order.items:
            product = get_product(db, item.product_id)
            if product:
                product.quantity += item.quantity
        
        # Delete order items first (though SQLAlchemy cascade could handle this, it's safer to be explicit or let DB handle it. We'll just delete the order and let cascade handle it, wait we didn't define cascade in models)
        for item in db_order.items:
            db.delete(item)

        db.delete(db_order)
        db.commit()
    return db_order
