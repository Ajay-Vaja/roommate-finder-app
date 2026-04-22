# Roommate Finder Backend

A Flask backend using REST APIs, SQLAlchemy, and JWT Authentication.

## Setup

1. Create a virtual environment: `python -m venv venv`
2. Activate it: `venv\Scripts\activate` (Windows)
3. Install dependencies: `pip install -r requirements.txt`
4. Setup database: `flask db init && flask db migrate && flask db upgrade`
5. Run the app: `flask run` or `python run.py`

## Architecture

We use clean architecture with separate controllers, services, models, and routes.
