import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';   // ホーム画面
import Service from './pages/Service';   // 概要画面

// タスク管理ツール
import List from './pages/tasks/List';   // リスト画面

function App() {
  return (
    <Router>
      <Routes>
        {/* デフォルト画面 */}
        <Route path="/" element={<Home />} />
        
        {/* サービス一覧 */}
        <Route path="/service" element={<Service />} />

        {/* タスク管理ツールのルート */}
        <Route path="/service/tasks" element={<List />} />
      </Routes>
    </Router>
  );
}

export default App;
