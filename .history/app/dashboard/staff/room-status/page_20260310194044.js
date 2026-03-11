'use client';

export default function RoomStatus() {
  return (
    <div>
      <h1 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#0F172B',
        fontFamily: "'Playfair Display', serif",
        marginBottom: '1rem'
      }}>
        Room Status
      </h1>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>
        Monitor and update room availability
      </p>

      {/* Room Status Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {[101, 102, 103, 104, 201, 202, 203, 204].map((room) => (
          <div key={room} style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: '600', color: '#0F172B' }}>Room {room}</h3>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                background: '#10b981',
                color: 'white'
              }}>Available</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#718096' }}>Deluxe Room</p>
          </div>
        ))}
      </div>
    </div>
  );
}