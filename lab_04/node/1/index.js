import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const dbName = 'database';
const port = 3000;
const authServer = 'http://localhost:3002/api/verify';

// Tworzymy połączenie z bazą danych SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `./${dbName}.db`  // Ścieżka do pliku bazy danych SQLite
});

// Sprawdzamy, czy połączenie zostało nawiązane poprawnie
sequelize.authenticate()
  .then(() => {
    console.log('Połączenie z bazą danych SQLite nawiązane!');
  })
  .catch((err) => {
    console.error('Błąd połączenia z bazą danych:', err);
  });


const Book = sequelize.define('Book', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    // Opcjonalne ustawienia
    tableName: 'books',  // Nazwa tabeli w bazie danych
  });

sequelize.sync()
  .then(() => {
    console.log('Tabela "books" została stworzona (lub już istnieje)');
  })
  .catch((err) => {
    console.error('Błąd synchronizacji:', err);
  });

const app = express();
app.use(express.json());

async function verifyTokenMiddleware(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
      return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
  }

  console.log(token);

  try {
      // Wyślij zapytanie do serwera weryfikującego token
      const response = await fetch(authServer, {
          method: 'GET',
          headers: {
              'Authorization': token
          },
      });

      // Sprawdź, czy serwer odpowiedział poprawnie
      if (!response.ok) {
          throw new Error('Błąd podczas weryfikacji tokenu');
      }
      
      return next();
  } catch (error) {
      console.error('Błąd:', error.message);
      res.status(500).json({ error: 'Błąd serwera podczas weryfikacji tokenu' });
  }
}

// Pobieranie wszystkich książek
app.get('/api/books', async (req, res) => {
    try {
      const books = await Book.findAll();
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: 'Błąd serwera' });
    }
  });
  
  // Pobieranie książki po ID
  app.get('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({ error: 'Książka nie znaleziona' });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: 'Błąd serwera' });
    }
  });
  
  // Dodawanie nowej książki
  app.post('/api/books', verifyTokenMiddleware, async (req, res) => {
    const { title, author, year } = req.body;
    try {
      const newBook = await Book.create({ title, author, year });
      res.status(201).json({ id: newBook.id });
    } catch (error) {
      res.status(500).json({ error: 'Błąd serwera' });
    }
  });
  
  // Usuwanie książki po ID
  app.delete('/api/books/:id', verifyTokenMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      const book = await Book.findByPk(id);
      if (!book) {
        return res.status(404).json({ error: 'Książka nie znaleziona' });
      }
      await book.destroy();
      res.status(204).send(); // Status 204 oznacza, że usunięto obiekt
    } catch (error) {
      res.status(500).json({ error: 'Błąd serwera' });
    }
  });

app.listen(port, () => {
    console.log(`Listen on ${port}`);
});