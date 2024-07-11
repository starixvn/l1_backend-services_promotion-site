import React from 'react';
import '../../public/static/css/style.scss';
import { useNavigate } from 'react-router-dom';

const LeaderBoard = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  }

  return (
    <div>
      <h1>  WELCOME LEADER BOARD </h1>

      <div>
        <button className="btn btn-primary" onClick={handleBackToHome}>BACK TO HOME</button>
      </div>

    </div>
  );
};


export default LeaderBoard;