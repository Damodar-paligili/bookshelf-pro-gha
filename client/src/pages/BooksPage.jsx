import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from './config';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/books`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, [token]);

  return (
    <div>
      <h2>Your Book Collection</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {books.map(book => (
          <div key={book.id} style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {book.cover_url && <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />}
            <h3 style={{ marginTop: '0.5rem' }}>{book.title}</h3>
            <p style={{ color: '#666' }}>By {book.author}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{book.description}</p>
            <div style={{ marginTop: '1rem' }}>
              <Link to={`/books/edit/${book.id}`} style={{ marginRight: '0.5rem', color: '#3498db' }}>Edit</Link>
              <Link to={`/books/${book.id}`} style={{ color: '#2ecc71' }}>Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
