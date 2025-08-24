import React from 'react';
import '../css/all.css';

function Service() {
    return (
        <div>
            <div class="h1-style">
                <h1>作成したサービス一覧</h1>
                <a href="/service/tasks"><h3>タスク管理ツール</h3></a>
                <h3>リアルタイムチャットアプリ</h3>
                <h3>パーソナライズされたダッシュボード</h3>
                <h3>eコマースプラットフォーム（簡易版）</h3>
            </div>
        </div>
    );
}

export default Service;
