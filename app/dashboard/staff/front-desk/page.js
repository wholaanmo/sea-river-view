'use client';

export default function FrontDesk() {
  return (
    <div>
      <h1 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#0F172B',
        fontFamily: "'Playfair Display', serif",
        marginBottom: '1rem'
      }}>
        Front Desk
      </h1>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>
        Manage check-ins, check-outs, and guest requests
      </p>

      {/* Today's arrivals */}
      <div style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0F172B', marginBottom: '1rem' }}>
          Today's Arrivals
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'John Smith', room: '304', time: '14:00' },
            { name: 'Emma Wilson', room: '201', time: '15:30' },
            { name: 'Michael Brown', room: '405', time: '16:00' }
          ].map((guest, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <div>
                <p style={{ fontWeight: '500', color: '#0F172B' }}>{guest.name}</p>
                <p style={{ fontSize: '0.875rem', color: '#718096' }}>Room {guest.room}</p>
              </div>
              <span style={{ fontSize: '0.875rem', color: '#00B8DB' }}>{guest.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}