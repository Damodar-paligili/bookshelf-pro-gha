import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from './config';

export default function EditBookPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTitle(res.data.title);
        setAuthor(res.data.author);
        setDescription(res.data.description || '');
        setCoverUrl(res.data.cover_url || '');
      } catch (err) {
        console.error(err);
      }
    };
    fetchBook();
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_BASE_URL}/books/${id}`,
        { title, author, description, cover_url: coverUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px' }}>
      <h2>Edit Book</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '0.75rem' }} />
        <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required style={{ padding: '0.75rem' }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows="4" style={{ padding: '0.75rem' }} />
        <input type="url" placeholder="Cover Image URL" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} style={{ padding: '0.75rem' }} />
        <button type="submit" style={{ padding: '0.75rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Update Book</button>
      </form>
    </div>
  );
}
