#region IMPORTS
# !-- Flask
from flask import Flask, render_template, redirect, url_for, g, session, request
from flask import flash, get_flashed_messages
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash

# !-- Decorators
import functools

# !-- Local modules
import database.database as database
import forms

# !-- Typing
from flask import Response
from sqlite3 import Connection

# !-- Game interface
import json
#endregion

#region FLASK CONFIG
app = Flask(__name__)
app.config["SECRET_KEY"] = "secretkey"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False
app.teardown_appcontext(database.close_db)
Session(app)
#endregion

@app.route("/", methods=["GET","POST"], strict_slashes=False)
def home_page() -> str:
    return render_template("generic/home.html")

#region AUTH
@app.before_request
def load_user() -> None:
    if "userid" not in session or session["userid"] is None:
        # not logged in, set defaults
        session["userid"] = None
        g.username = None
        g.user_permission = None
    else:
        # logged in, load user
        db: Connection = database.get_db()
        query: list = db.execute("SELECT username,permission_id FROM users WHERE id = ?",(session["userid"],)).fetchone()
        g.username = query["username"]
        g.user_permission = query["permission_id"]

# !-- Decorators
def login_required(v):
    @functools.wraps(v)
    def wrapped_v(*args, **kwargs):
        if not session.get("userid"):
            session["redirect"] = v.__name__
            print("Login required. Redirect to", session["redirect"])
            return redirect(url_for("login_page"))
        return v(*args, **kwargs)
    return wrapped_v

def logout_required(v):
    @functools.wraps(v)
    def wrapped_v(*args, **kwargs):
        if session.get("userid"):
            return redirect(url_for("home_page"))
        return v(*args, **kwargs)
    return wrapped_v

def admin_required(v):
    @login_required
    @functools.wraps(v)
    def wrapped_v(*args, **kwargs):
        if g.user_permission != 2:
            print("NOT ADMIN")
            return redirect(url_for("home_page"))
        return v(*args,**kwargs)
    return wrapped_v

# !-- Routes
@app.route("/register/", methods=["GET","POST"], strict_slashes=False)
@logout_required
def register_page() -> str | Response:
    form = forms.RegisterForm()
    if form.validate_on_submit():
        db: Connection = database.get_db()

        # !-- Check if username is already taken.
        if db.execute("SELECT id FROM users WHERE lower(username) LIKE ? ;", (f"%{form.username.data.lower()}%",)).fetchone():
            form.username.errors += ["Username already exists."]

        # !-- No errors: create account
        if not form.username.errors and not form.password.errors:
            username: str = form.username.data
            password: str = form.password.data

            db.execute("INSERT INTO users(username, password) VALUES (?,?) ;",(username,generate_password_hash(password)))
            db.commit()

            flash("Account created successfully.")
            return redirect(url_for("login_page"))
    return render_template("auth/register.html", form=form)

@app.route("/login/", methods=["GET","POST"], strict_slashes=False)
@logout_required
def login_page() -> str | Response:
    form = forms.LoginForm()
    message: str = get_flashed_messages()
    if form.validate_on_submit():
        db: Connection = database.get_db()
        query: list = db.execute("SELECT * FROM users WHERE username = ? ;",(form.username.data,)).fetchone()
        
        # !-- Username/password checks
        if not query:
            form.username.errors += ["Username not found."]
        elif not check_password_hash(query["password"], form.password.data):
            form.password.errors += ["Incorrect password."]

        # !-- Correct username/password: login
        if not form.username.errors and not form.password.errors:
            session["userid"] = query["id"]

            # redirect back to wherever login was required to go to, or the home page
            print("Redirect to:", session.get("redirect"))
            return redirect(url_for(session.pop("redirect","home_page")))
    return render_template("auth/login.html", form=form, message=message)

@app.route("/logout/", methods=["GET"], strict_slashes=False)
def logout() -> Response:
    page: str = session.pop("redirect","home_page")
    session.clear()
    return redirect(url_for(page))
#endregion

#region GAME
@app.route("/game", methods=["GET","POST"], strict_slashes=False)
@login_required
def game_page() -> str | Response:
    return render_template("game/game.html")

@app.route("/editor", methods=["GET","POST"], strict_slashes=False)
@admin_required
def editor_page() -> str | Response:
    return render_template("editor/editor.html")

@app.route("/upload_level", methods=["POST"], strict_slashes=False)
@admin_required
def upload_level() -> str:
    print(session.get("userid"))
    db: Connection = database.get_db()
    try:
        db.execute("""INSERT INTO levels(creator_id, name, floor) VALUES (?,?,?)""",(session["userid"], request.form["name"], request.form["floor"]))
        db.commit()
        return "success"
    except Exception as e:
        return "failure"
    
@app.route("/load_level", methods=["POST"], strict_slashes=False)
def load_level() -> str:
    db = database.get_db()
    floor: str = db.execute("""SELECT floor FROM levels WHERE name = ?""",(request.form["name"],)).fetchone()[0]
    floor = json.loads(floor) # data is stored as json, so we need to convert it BACK to an object
    if floor:
        return floor # now it will be converted BACK to json to be transferred to the js :D
    else:
        return "failure"
#endregion