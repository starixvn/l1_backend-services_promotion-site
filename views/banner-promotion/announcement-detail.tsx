import React from 'react';
import { useTranslate } from '@tolgee/react';

interface AnnouncementDetailProps {
  data: {
    announcementTittle: string;
    terms: string;
    duration: string;
    eligibleGames: string;
    freeSpinReward: string | number;
    totalBetPerSpin: string | number;
    game: any;
  };
}

const AnnouncementDetail: React.FC<AnnouncementDetailProps> = ({ data }) => {
  const { announcementTittle, terms, duration, eligibleGames, freeSpinReward, totalBetPerSpin, game } = data;
  const { t } = useTranslate();

  // Parse eligibleGames to array of numbers
  const eligibleGameIds = eligibleGames
    ? eligibleGames.split(',').map((id: string) => Number(id.trim())).filter((id: number) => !isNaN(id))
    : [];

  // Get eligible game objects from game prop
  let eligibleGameNames: string[] = [];
  console.log("game", game);
  if (Array.isArray(game)) {
    eligibleGameNames = game
      .filter((g: any) => eligibleGameIds.includes(Number(g.gameId)))
      .map((g: any) => t('game_name', undefined, { ns: g.name }));
  }

  // Fallback: if no eligibleGameNames, show eligibleGames as string
  const eligibleGamesDisplay = eligibleGameNames.length > 0 ? eligibleGameNames.join(', ') : eligibleGames;

  return (
    <div style={{
      background: 'rgba(0,0,0,0.95)',
      color: '#fff',
      borderRadius: 12,
      padding: 32,
      maxWidth: 900,
      margin: '40px auto',
      position: 'relative',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
    }}>
      {/* Back button */}
      <button
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: '#e0e0e0',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          color: '#222',
          fontSize: 22,
          cursor: 'pointer',
          fontWeight: 'bold',
          zIndex: 2,
          transition: 'background 0.2s',
        }}
        aria-label="Back"
        onClick={() => window.history.back()}
        onMouseOver={e => (e.currentTarget.style.background = '#bdbdbd')}
        onMouseOut={e => (e.currentTarget.style.background = '#e0e0e0')}
      >{'<'}
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-block',
          background: '#ffe600',
          color: '#222',
          fontWeight: 700,
          fontSize: 32,
          padding: '8px 32px',
          borderRadius: 6,
          margin: '0 auto'
        }}>
          {announcementTittle}
        </div>
      </div>

      {/* Promotion Info */}
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Promotion Information</div>
      <div style={{
        background: 'rgba(100,100,0,0.2)',
        borderRadius: 8,
        padding: 20,
        marginBottom: 32,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 18,
        fontWeight: 500,
        border: '1px solid #888'
      }}>
        <div style={{ flex: 1, display: 'flex', maxWidth: 225, flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Duration</div>
          <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{duration}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Eligible Games</div>
          <div style={{ textAlign: 'center', whiteSpace: 'pre-line' }}>{t('game_name', undefined, { ns: "dragonball" })}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Free Spin Reward</div>
          <div style={{ textAlign: 'center' }}>{freeSpinReward}</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ color: '#ffe600', fontWeight: 700, fontSize: 22, marginBottom: 4 }}>Total Bet per Spin</div>
          <div style={{ textAlign: 'center' }}>{totalBetPerSpin}</div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Terms & Conditions</div>
      <div style={{
        background: 'rgba(100,100,0,0.2)',
        borderRadius: 8,
        padding: 20,
        border: '1px solid #888'
      }}>
        {terms}
      </div>
    </div>
  );
};

export default AnnouncementDetail; 