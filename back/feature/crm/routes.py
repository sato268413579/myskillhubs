from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from sqlalchemy import func
from config.db import db
from models.Customer import Customer
from models.Tag import Tag
from models.Deal import Deal
from models.Contact import Contact
from datetime import datetime

crm_bp = Blueprint("crm", __name__, url_prefix="/api/customers")

# 一覧（軽量）
@crm_bp.route("", methods=["GET"])
@login_required
def get_customers_route():
    user_id = current_user.id
    customers = Customer.query.filter_by(user_id=user_id).order_by(Customer.created_at.desc()).all()
    return jsonify([c.to_dict() for c in customers])

# 作成（基本情報＋タグ）
# POST /customers/create
@crm_bp.route("/create", methods=["POST"])
@login_required
def create_customer_route():
    data = request.json

    user_id = current_user.id

    new_c = Customer(
        name=data.get("name"),
        user_id=user_id,
        email=data.get("email"),
        company=data.get("company"),
        department=data.get("department"),
        title=data.get("title"),
        phone=data.get("phone"),
        mobile=data.get("mobile"),
        address=data.get("address"),
        note=data.get("note"),
    )
    db.session.add(new_c)
    db.session.commit()

    # tags を処理
    for tag_name in data.get("tags", []):
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
        new_c.tags.append(tag)
    # deals
    for deal_title in data.get("deals", []):
        deal = Deal(title=deal_title.title, customer=new_c)
        db.session.add(deal)

    # contacts
    for contact_type in data.get("contacts", []):
        contact = Contact(contact_type=contact_type.contact_type, customer=new_c)
        db.session.add(contact)

    db.session.commit()

    return jsonify(new_c.to_dict()), 201


# 1件取得（詳細：履歴含む）
# GET /customers/<id>
@crm_bp.route("/<int:id>", methods=["GET"])
@login_required
def get_customer_detail_route(id):
    c = Customer.query.get_or_404(id)
    return jsonify(c.to_dict())

# 更新（基本情報＋タグ差し替えも可能）
# PUT /customers/<id>
@crm_bp.route("/<int:id>", methods=["PUT"])
@login_required
def update_customer_route(id):
    data = request.get_json() or {}
    c = Customer.query.get_or_404(id)
    for field in ["name","email","company","department","title","phone","mobile","address","note"]:
        if field in data:
            setattr(c, field, data[field])

    if "tags" in data:
        c.tags.clear()
        for tname in data.get("tags") or []:
            tname = (tname or "").strip()
            if not tname:
                continue
            tag = Tag.query.filter(func.lower(Tag.name) == tname.lower()).first()
            if not tag:
                tag = Tag(name=tname)
                db.session.add(tag)
            c.tags.append(tag)

    db.session.commit()
    return jsonify(c.to_dict(detailed=True))

# 削除
# DELETE /customers/<id>
@crm_bp.route("/<int:id>", methods=["DELETE"])
@login_required
def delete_customer_route(id):
    c = Customer.query.get_or_404(id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

# --- 取引履歴（Deals） ---
# GET /customers/<id>/deals
@crm_bp.route("/<int:id>/deals", methods=["GET"])
@login_required
def list_deals_route(id):
    Customer.query.get_or_404(id)
    deals = Deal.query.filter_by(customer_id=id).order_by(Deal.created_at.desc()).all()
    return jsonify([d.to_dict() for d in deals])

# POST /customers/<id>/deals
@crm_bp.route("/<int:id>/deals", methods=["POST"])
def create_deal_route(id):
    Customer.query.get_or_404(id)
    data = request.get_json() or {}

    user_id = current_user.id

    deal = Deal(
        customer_id=id,
        user_id=user_id,
        title=data.get("title"),
        amount=data.get("amount"),
        status=data.get("status"),
        closed_at=datetime.fromisoformat(data["closed_at"]) if data.get("closed_at") else None,
    )
    db.session.add(deal)
    db.session.commit()
    return jsonify(deal.to_dict()), 201

# --- コンタクト履歴（Contact Logs） ---
# GET /customers/<id>/contacts
@crm_bp.route("/<int:id>/contacts", methods=["GET"])
def list_contacts_route(id):
    Customer.query.get_or_404(id)
    logs = Contact.query.filter_by(customer_id=id).order_by(Contact.contact_date.desc()).all()
    return jsonify([l.to_dict() for l in logs])

# POST /customers/<id>/contacts
@crm_bp.route("/<int:id>/contacts", methods=["POST"])
def create_contact_route(id):
    Customer.query.get_or_404(id)
    data = request.get_json() or {}

    user_id = current_user.id

    log = Contact(
        customer_id=id,
        user_id=user_id,
        contact_type=data.get("contact_type") or "note",
        note=data.get("note"),
        contact_date=datetime.fromisoformat(data["contact_date"]) if data.get("contact_date") else datetime.utcnow(),
    )
    db.session.add(log)
    db.session.commit()
    return jsonify(log.to_dict()), 201
