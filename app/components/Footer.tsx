export default function Footer() {
  return (
    <footer style={{ background: '#f5f5f5', borderTop: '1px solid #ddd', fontSize: 14, color: '#666', marginTop: 32, padding: '12px 0' }}>
      <div className="main-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>&copy; 2025 НИВЦ, МГУ</div>
        <div>Next.js</div>
      </div>
    </footer>
  );
}