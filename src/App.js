import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import './App.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function App() {
  const [bookId, setBookId] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookPublished, setBookPublished] = useState('');
  const [bookPrice, setBookPrice] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    getAllBooks();
  }, []);

  const handleInsertBook = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('book_id', bookId);
    formData.append('book_name', bookName);
    formData.append('book_description', bookDescription);
    formData.append('book_published', bookPublished);
    formData.append('book_price', bookPrice);

    try {
      const response = await fetch('http://elnidoleatherback.com/nu/nextgen_v1/api/insert_book', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        if (text.startsWith('<!DOCTYPE html>')) {
          const errorHtml = new DOMParser().parseFromString(text, 'text/html');
          const errorMessage = errorHtml.querySelector('p').textContent;
          setError(errorMessage);
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        }
      }

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setBookId('');
        setBookName('');
        setBookDescription('');
        setBookPublished('');
        setBookPrice('');
        getAllBooks();
      } else if (data.status === 'ERROR' && data.message === 'Book ID already exists') {
        setError('Book ID already exists. Please choose a different ID.');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  const getAllBooks = async () => {
    try {
      const response = await fetch('http://elnidoleatherback.com/nu/nextgen_v1/api/get_all_books', {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      }
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setBooks(data.result.map(book => ({ ...book, isEditing: false })));
      } else {
        setBooks([]);
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleEditToggle = (index) => {
    setBooks(books.map((book, i) => i === index ? { ...book, isEditing: !book.isEditing } : book));
  };

  const handleEditChange = (index, field, value) => {
    setBooks(books.map((book, i) => i === index ? { ...book, [field]: value } : book));
  };

  const handleDeleteBook = async (index) => {
    const bookId = books[index].book_id;
    try {
      const response = await fetch(`http://elnidoleatherback.com/nu/nextgen_v1/api/delete_book`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book_id: bookId }),
      });
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      }
  
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setBooks(books.filter((book, i) => i!== index));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleSaveEdit = async (index) => {
    const book = books[index];
    const formData = new FormData();
    formData.append('book_id', book.book_id);
    formData.append('book_name', book.book_name);
    formData.append('book_description', book.book_description);
    formData.append('book_published', book.book_published);
    formData.append('book_price', book.book_price);

    try {
      const response = await fetch('http://elnidoleatherback.com/nu/nextgen_v1/api/update_book', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      }

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        setBooks(books.map((b, i) => i === index ? { ...b, isEditing: false } : b));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleSearch = () => {
    const filteredBooks = books.filter(book => book.book_id === searchId);
    if (filteredBooks.length > 0) {
      setBooks(filteredBooks);
    } else {
      setError('No book found with the given ID');
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  return (
    <div className="form-container">
      <header className="App-header">
        <span className="heading">Manage Books</span>
        <form onSubmit={handleInsertBook} className="book-form">
          <div className="form">
            <input
              placeholder="Book ID"
              className="input"
              type="text"
              id="book_id"
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              required
            />
            <input
              placeholder="Book Name"
              className="input"
              type="text"
              id="book_name"
              value={bookName}
              onChange={(e) => setBookName(e.target.value)}
              required
            />
            <textarea
              className="textarea"
              placeholder="Book Description"
              id="book_description"
              value={bookDescription}
              onChange={(e) => setBookDescription(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Published Date (YYYY-MM-DD)"
              type="text"
              id="book_published"
              value={bookPublished}
              onChange={(e) => setBookPublished(e.target.value)}
              pattern="\d{4}-\d{2}-\d{2}"
              required
            />
            <input
              className="input"
              placeholder="Book Price"
              type="text"
              id="book_price"
              value={bookPrice}
              onChange={(e) => setBookPrice(e.target.value)}
              pattern="^\d+(\.\d{1,2})?$"
              required
            />
            <button type="submit">Insert Book</button>
          </div>
        </form>
        {error && <p className="error-message">{error}</p>}

        <div className="book-list">
          <h2>Book List</h2>
          <div className="search-container">
            <input
              className="search"
              type="text"
              placeholder="Search by Book ID...."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button className="searchButton" onClick={handleSearch}><span className="span">🔎</span></button>
          </div>
          {books.length > 0 ? (
            <Slider {...settings}>
              {books.map((book, index) => (
                <div key={book.book_id} className="book-card">
                  {book.isEditing ? (
                    <div className="card-content">
                      <input
                      className="input"
                        type="text"
                        value={book.book_name}
                        onChange={(e) => handleEditChange(index, 'book_name', e.target.value)}
                      />
                      <textarea
                      className="input"
                        value={book.book_description}
                        onChange={(e) => handleEditChange(index, 'book_description', e.target.value)}
                      />
                      <input
                      className="input"
                        type="text"
                        value={book.book_published}
                        onChange={(e) => handleEditChange(index, 'book_published', e.target.value)}
                      />
                      <input
                      className="input"
                        type="text"
                        value={book.book_price}
                        onChange={(e) => handleEditChange(index, 'book_price', e.target.value)}
                      />
                      <button className="edit" onClick={() => handleSaveEdit(index)}>Save</button>
                    </div>
                  ) : (
                    <div className="card-content">
                      <div><strong>Book ID:</strong> {book.book_id}</div>
                      <div><strong>Book Name:</strong> {book.book_name}</div>
                      <div><strong>Description:</strong> {book.book_description}</div>
                      <div><strong>Published Date:</strong> {book.book_published}</div>
                      <div><strong>Price:</strong> {book.book_price}</div>
                      <button className="edit" onClick={() => handleEditToggle(index)}>Edit</button>
                      <button className="edit" onClick={() => handleDeleteBook(index)}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </Slider>
          ) : (
            <p>No books found.</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
