# アカウントを直接DBに登録する際にパスワードをハッシュ化させるときに使用する
# ※ bcrypt モジュールはコンテナに入っていないのでインストール作業必要。
import bcrypt

password = "admin"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hashed.decode('utf-8'))
