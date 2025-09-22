import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImgUploader = () => {
  const [image, setImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all images from backend
  const getImages = async () => {
    try {
      const result = await axios.get('http://localhost:5000/getImage');
      setAllImages(result.data.data || []);
    } catch (e) {
      console.error('Error getting image', e);
      setError('Failed to fetch images');
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  // Handle file selection
  const onImgChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setError(null);
    }
  };

  // Upload image to backend
  const submitImg = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      setUploading(true);
      await axios.post('http://localhost:5000/uploadImg', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(null);
      await getImages();
    } catch (e) {
      console.error('Upload error', e);
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '40px auto',
        padding: '20px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Upload Product Image</h2>

      <form onSubmit={submitImg}>
        <input
          type="file"
          accept="image/*"
          onChange={onImgChange}
          style={{ display: 'block', marginBottom: '16px' }}
        />
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4f46e5',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {/* Display uploaded images */}
      {allImages.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ marginBottom: '12px' }}>Uploaded Images</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
            }}
          >
            {allImages.map((img) => (
              <img
                key={img._id || img.url}
                src={img.url}
                alt="uploaded"
                style={{
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImgUploader;
