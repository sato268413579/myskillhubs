import React from 'react';
import '../css/home-nav.css';
import '../App';

const Home: React.FC = () => {
  return (
    <div className="home-header">
      <ul className="link-list">
        <li><a href="/service">サービス</a></li>
      </ul>
    </div>
  );
};

export default Home;
