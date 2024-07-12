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
      <div className="leaderboard">
        <h2 className="text-center">Leaderboard</h2>
        <div className="board-table">
          <div className="board-header">
            <div className="place">Ranking</div>
            <div className="name">Nickname</div>
            <div className="points">Total Points</div>
          </div>
          <div className="board-body">
            <div className="board-row top-3">
              <div>
                <span className="ranking-place place-first">1</span>
              </div>
              <div>O***149</div>
              <div>1223</div>
            </div>
            <div className="board-row top-3">
              <div>
                <span className="ranking-place place-second">2</span>
              </div>
              <div>E***663</div>
              <div>1007</div>
            </div>
            <div className="board-row top-3 player">
              <div>
                <span className="ranking-place place-third">3</span>
              </div>
              <div>You</div>
              <div>987</div>
            </div>
            <div className="board-row">
              <div>
                <span className="ranking-place">4</span>
              </div>
              <div>W***345</div>
              <div>865</div>
            </div>
            <div className="board-row">
              <div>
                <span className="ranking-place">5</span>
              </div>
              <div>N***918</div>
              <div>701</div>
            </div>
            <div className="board-row">
              <div>
                <span className="ranking-place">6</span>
              </div>
              <div>R***128</div>
              <div>531</div>
            </div>
            <div className="board-row">
              <div>
                <span className="ranking-place">7</span>
              </div>
              <div>B***519</div>
              <div>401</div>
            </div>
          </div>
          <div className="board-body">
            <div className="board-row player">
              <div>
                <span className="ranking-place place-third">3</span>
              </div>
              <div>You</div>
              <div>987</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LeaderBoard;