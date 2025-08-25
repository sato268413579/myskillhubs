FROM python:3.11

WORKDIR /app

# 依存関係をインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 開発環境は docker-compose の volume mount で上書きされるので COPY . . は不要でもよい
COPY . .

EXPOSE 5000
