import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from './config';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBook(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`${API_BASE_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!book) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px' }}>
      {book.cover_url && <img src={book.cover_url} alt={book.title} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '4px' }} />}
      <h2 style={{ marginTop: '1rem' }}>{book.title}</h2>
      <h4 style={{ color: '#666', marginTop: '0.5rem' }}>By {book.author}</h4>
      <p style={{ marginTop: '1rem', lineHeight: '1.6' }}>{book.description}</p>
      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={handleDelete} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: '4px' }}>
          Delete Book
        </button>
      </div>
    </div>
  );
}
