import React from 'react';
import '../../public/static/css/style.scss';
import { useNavigate } from 'react-router-dom';

const Promotions = () => {
  const navigate = useNavigate();

  const handleMoreInfo = () => {
    navigate('/promotion/promotion-details');
  }

  return (
    <div>
      <div className="promotion-container">
        <h2>Promotions</h2>
        <ul className="promotion-list">
          <li className="promotion-item">
            <img src="static/images/image-1.png" alt="promotion 1" width={150} />
            <div className="promotion-description">
              <h3>Promotion 1</h3>
              <p>Description of promotion 1</p>
              <p>Take place from 10/17/2024 to 10/23/2024</p>
              <button className="btn btn-primary" onClick={handleMoreInfo}>More Info</button>
            </div>
          </li>

          <li className="promotion-item">
            <img src="static/images/image-2.png" alt="promotion 2" width={150} />
            <div className="promotion-description">
              <h3>Promotion 2</h3>
              <p>Description of promotion 2</p>
              <p className="text-red">Completed</p>
              <button className="btn btn-primary" onClick={handleMoreInfo}>More Info</button>
            </div>
          </li>
        </ul>
      </div>
    </div>

  );
};

export default Promotions;