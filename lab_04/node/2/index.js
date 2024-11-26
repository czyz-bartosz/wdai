import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const dbName = 'database';
const port = 3000;

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

// Definicja modelu "Order"
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
    console.log('Tabela "orders" została stworzona (lub już istnieje)');
  })
  .catch((err) => {
    console.error('Błąd synchronizacji:', err);
  });

// Tworzymy aplikację Express
const app = express();
app.use(express.json());

// Pobieranie wszystkich zamówień dla użytkownika
app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.findAll({ where: { userId } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Dodawanie zamówienia
app.post('/api/orders', async (req, res) => {
  const { userId, bookId, quantity } = req.body;
  try {
    // Sprawdzamy, czy bookId i quantity są poprawne
    if (!bookId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Nieprawidłowe dane wejściowe' });
    }

    // Tworzymy nowe zamówienie
    const newOrder = await Order.create({ userId, bookId, quantity });
    res.status(201).json({ orderId: newOrder.id });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Usuwanie zamówienia
app.delete('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }
    await order.destroy();
    res.status(204).send(); // Status 204 oznacza, że usunięto obiekt
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Aktualizowanie zamówienia (np. zmiana ilości)
app.patch('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { quantity } = req.body; // Możliwość zmiany tylko ilości
  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Zamówienie nie znalezione' });
    }
    if (quantity && quantity > 0) {
      order.quantity = quantity;
      await order.save();
      res.json(order);
    } else {
      res.status(400).json({ error: 'Niepoprawna ilość' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Uruchomienie aplikacji na porcie 3000
app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
