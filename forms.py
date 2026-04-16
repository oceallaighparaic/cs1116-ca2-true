from flask_wtf import FlaskForm
from wtforms import SubmitField, StringField, PasswordField
from wtforms.validators import InputRequired, EqualTo

class RegisterForm(FlaskForm):
    username = StringField("Username:", validators=[InputRequired()])
    password = PasswordField("Password:", validators=[InputRequired()])
    confirm_pw = PasswordField("Confirm Password:",validators=[EqualTo("password")])
    submit = SubmitField("Register")

class LoginForm(FlaskForm):
    username = StringField("Username:", validators=[InputRequired()])
    password = PasswordField("Password:", validators=[InputRequired()])
    submit = SubmitField("Log In")