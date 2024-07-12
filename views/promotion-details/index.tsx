import React from 'react';
import '../../public/static/css/style.scss';
import { useNavigate } from 'react-router-dom';

const PromotionDetail = () => {
  const navigate = useNavigate();

  const handleLeaderBoard = () => {
    navigate('/promotion/leader-board');
  }

  return (
    <div>
      <div className="tournament-container">
        <h2 className="text-center">Weekly Tournament</h2>
        <p className="text-center">Place bet and win up to $1000</p>

        <div className="info-container promotion">
          <h3 className="title">Promotion Information</h3>
          <div className="info-list">
            <div className="info-item">
              <h3>Duration</h3>
              <p>Take place from 10/17/2024 to 10/23/2024</p>
            </div>
            <div className="info-item">
              <h3>Eligible Games</h3>
              <p>All games</p>
            </div>
            <div className="info-item">
              <h3>Total Prize</h3>
              <p>USD $2000</p>
            </div>
          </div>
        </div>

        <div className="info-container participation">
          <h3 className="title">Participation Steps</h3>
          <div className="info-list">
            <div className="info-item">
              <h3>Step 1</h3>
              <p>Place a bet with a minimum total stake of $0.2 for slot games and $2 for others</p>
            </div>
            <div className="info-item">
              <h3>Step 2</h3>
              <p>Win bet and accumulate rewarded points</p>
            </div>
            <div className="info-item">
              <h3>Step 3</h3>
              <p>In the top 3 and win the prize</p>
            </div>
          </div>
        </div>

        <div className="info-container prize">
          <h3 className="title">Prize Categories</h3>
          <div className="info-list">
            <div className="info-item">
              <img src="static/images/first-prize.png" alt="Prize 1" />
              <div>
                <h3>First Place</h3>
                <p>$1000</p>
              </div>
            </div>
            <div className="info-item">
              <img src="static/images/second-prize.png" alt="Prize 2" />
              <div>
                <h3>Second Place</h3>
                <p>$600</p>
              </div>
            </div>
            <div className="info-item">
              <img src="static/images/third-prize.png" alt="Prize 3" />
              <div>
                <h3>Third Place</h3>
                <p>$400</p>
              </div>
            </div>
          </div>
        </div>

        <div className="terms-conditions">
          <h3 className="title">Terms & Conditions</h3>
          <ul>
            <li>Terms 1</li>
            <li>Terms 2</li>
            <li>Terms 3</li>
            <li>Terms 4</li>
            <li>Terms 5</li>
          </ul>
        </div>
      </div>

      <div>
        <button className="btn btn-primary" onClick={handleLeaderBoard}>Leader Board</button>
      </div>
    </div>
  );
};


export default PromotionDetail;