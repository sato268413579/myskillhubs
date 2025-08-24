from fastapi import FastAPI
import mysql.connector

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/db-check")
def db_check():
    conn = mysql.connector.connect(
        host="db", user="root", password="example", database="myapp"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    conn.close()
    return {"db_time": result[0]}
