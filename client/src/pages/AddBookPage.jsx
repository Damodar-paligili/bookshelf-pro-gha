import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from './config';

export default function AddBookPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/books`,
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
      <h2>Add New Book</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '0.75rem' }} />
        <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required style={{ padding: '0.75rem' }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows="4" style={{ padding: '0.75rem' }} />
        <input type="url" placeholder="Cover Image URL" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} style={{ padding: '0.75rem' }} />
        <button type="submit" style={{ padding: '0.75rem', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Book</button>
      </form>
    </div>
  );
}
