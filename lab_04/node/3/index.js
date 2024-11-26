import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const dbName = 'database';
const port = 3002;
const secretKey = 'secret';

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

// Model "User" - do rejestracji i logowania
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
});

// Model "Order"
const Order = sequelize.define('Order', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
}, {
  tableName: 'orders',
});

// Synchronizacja bazy danych
sequelize.sync()
  .then(() => {
    console.log('Tabele "users" i "orders" zostały stworzona (lub już istnieją)');
  })
  .catch((err) => {
    console.error('Błąd synchronizacji:', err);
  });

// Tworzymy aplikację Express
const app = express();
app.use(express.json());

// Funkcja do generowania JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
};

// Middleware do weryfikacji JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu autoryzacyjnego' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Nieprawidłowy token' });
    }
    req.userId = decoded.userId;
    next();
  });
};

// Endpoint do weryfikacji tokena
app.get('/api/verify', verifyToken, (req, res) => {
  res.json({ message: 'Token jest ważny', user: req.userId });
});


// Rejestracja użytkownika
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Sprawdzamy, czy użytkownik z takim e-mailem już istnieje
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik o podanym e-mailu już istnieje' });
    }

    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzymy nowego użytkownika
    const newUser = await User.create({ email, password: hashedPassword });

    // Generowanie tokenu JWT
    const token = generateToken(newUser.id);

    res.status(201).json({ userId: newUser.id, token });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Logowanie użytkownika
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    // Sprawdzamy hasło
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Nieprawidłowe hasło' });
    }

    // Generowanie tokenu JWT
    const token = generateToken(user.id);

    res.json({ userId: user.id, token });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Uruchomienie aplikacji na porcie 3000
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
