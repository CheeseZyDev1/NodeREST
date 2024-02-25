const express = require('express');
const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');

const app = express();

app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './Database/Karaoke.sqlite'
});

// สร้างโครงสร้างฐานข้อมูล

const RoomInformation = sequelize.define('RoomInformation', {
    RoomID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Seats: {
        type: DataTypes.INTEGER
    },
    Location: {
        type: DataTypes.STRING
    }
});

const ReservationInformation = sequelize.define('ReservationInformation', {
    ReservationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ReservationTime: {
        type: DataTypes.DATE
    },
    CustomerName: {
        type: DataTypes.STRING
    },
    NumberOfPeople: {
        type: DataTypes.INTEGER
    }
});

const PaymentTracking = sequelize.define('PaymentTracking', {
    PaymentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    PaymentStatus: {
        type: DataTypes.STRING
    }
});

const RoomAvailability = sequelize.define('RoomAvailability', {
    AvailabilityID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    IsAvailable: {
        type: DataTypes.BOOLEAN
    }
});

const FeedbackSystem = sequelize.define('FeedbackSystem', {
    FeedbackID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    FeedbackText: {
        type: DataTypes.TEXT
    },
    Rating: {
        type: DataTypes.INTEGER
    }
});

// สร้างความสัมพันธ์

RoomInformation.hasMany(ReservationInformation, { foreignKey: 'RoomID' });
ReservationInformation.belongsTo(RoomInformation, { foreignKey: 'RoomID' });

ReservationInformation.hasOne(PaymentTracking, { foreignKey: 'ReservationID' });
PaymentTracking.belongsTo(ReservationInformation, { foreignKey: 'ReservationID' });

RoomInformation.hasMany(RoomAvailability, { foreignKey: 'RoomID' });
RoomAvailability.belongsTo(RoomInformation, { foreignKey: 'RoomID' });

// เพิ่มข้อมูลตัวอย่าง
app.post('/insertData', async (req, res) => {
    try {
      const room = await RoomInformation.create({
        Seats: 17,
        Location: 'Room A'
      });
  
      const reservation = await ReservationInformation.create({
        RoomID: room.RoomID,
        ReservationTime: new Date(),
        CustomerName: 'John Doe',
        NumberOfPeople: 5
      });
  
      const payment = await PaymentTracking.create({
        ReservationID: reservation.ReservationID,
        Amount: 50.00,
        PaymentStatus: 'Paid'
      });
  
      const availability = await RoomAvailability.create({
        RoomID: room.RoomID,
        IsAvailable: true
      });
  
      const feedback = await FeedbackSystem.create({
        FeedbackText: 'Great experience!',
        Rating: 5
      });
  
      res.status(201).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
  // Update data by ID
app.put('/updateData/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      // Define the tables you want to update
      const tablesToUpdate = [
        { model: RoomInformation, data: req.body },
        { model: ReservationInformation, data: { NumberOfPeople: 8 } },
        // Add more tables as needed
      ];
  
      for (const { model, data } of tablesToUpdate) {
        // Find the record by PK
        const record = await model.findByPk(id);
  
        if (!record) {
          return res.status(404).json({ error: `${model.name} not found`, message: `${model.name} with ID ${id} not found` });
        }
  
        // Log the current data before update
        console.log(`Current ${model.name} Data:`, record.toJSON());
  
        // Update the record
        await record.update(data);
  
        // Log the updated data
        console.log(`Updated ${model.name} Data:`, record.toJSON());
      }
  
      res.send({ message: 'Data updated successfully' });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
  
/*
// Update data by ID
app.put('/updateData/:id', async (req, res) => {
    try {
      const roomId = req.params.id;
  
      // Find RoomInformation by PK
      const room = await RoomInformation.findByPk(roomId);
  
      if (!room) {
        return res.status(404).json({ error: 'Room not found', message: `Room with ID ${roomId} not found` });
      }
  
      // Log the current data before update
      console.log('Current Room Data:', room.toJSON());
  
      // Update RoomInformation
      await room.update(req.body);
  
      // Log the updated data
      console.log('Updated Room Data:', room.toJSON());
  
        // Find ReservationInformation by PK
      const reservation = await ReservationInformation.findByPk(roomId);
  
      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found', message: `Reservation with ID ${roomId} not found` });
      }
  
      // Log the current data before update
      console.log('Current Reservation Data:', reservation.toJSON());
  
      // Update ReservationInformation
      await reservation.update({ NumberOfPeople: 8 });
  
      // Log the updated data
      console.log('Updated Reservation Data:', reservation.toJSON());
  
      // Repeat the same process for other tables...
  
      res.send(room);
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
  
  */
  
  
  // Delete data by ID
  app.delete('/deleteData/:id', async (req, res) => {
    try {
      const roomId = req.params.id;
      
      // Delete RoomInformation
      await RoomInformation.destroy({ where: { RoomID: roomId } });
  
      // Delete ReservationInformation
      await ReservationInformation.destroy({ where: { RoomID: roomId } });
  
      // Delete PaymentTracking
      await PaymentTracking.destroy({ where: { ReservationID: roomId } });
  
      // Delete RoomAvailability
      await RoomAvailability.destroy({ where: { RoomID: roomId } });
  
      // Delete FeedbackSystem
      await FeedbackSystem.destroy({ where: { FeedbackID: roomId } });
  
      res.status(200).json({ message: 'Data deleted successfully' });
    } catch (error) {
      console.error('Error deleting data:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
  
  // Select all data
  app.get('/selectAllData', async (req, res) => {
    try {
      const roomData = await RoomInformation.findAll();
      const reservationData = await ReservationInformation.findAll();
      const paymentData = await PaymentTracking.findAll();
      const availabilityData = await RoomAvailability.findAll();
      const feedbackData = await FeedbackSystem.findAll();
  
      res.status(200).json({
        RoomInformation: roomData,
        ReservationInformation: reservationData,
        PaymentTracking: paymentData,
        RoomAvailability: availabilityData,
        FeedbackSystem: feedbackData
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
  
  // Select data by ID
  app.get('/selectById/:id', async (req, res) => {
    try {
      const roomId = req.params.id;
  
      const roomData = await RoomInformation.findByPk(roomId);
      const reservationData = await ReservationInformation.findByPk(roomId);
      const paymentData = await PaymentTracking.findByPk(roomId);
      const availabilityData = await RoomAvailability.findByPk(roomId);
      const feedbackData = await FeedbackSystem.findByPk(roomId);
  
      res.status(200).json({
        RoomInformation: roomData,
        ReservationInformation: reservationData,
        PaymentTracking: paymentData,
        RoomAvailability: availabilityData,
        FeedbackSystem: feedbackData
      });
    } catch (error) {
      console.error('Error fetching data by ID:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });
  

// เริ่มต้นเซิร์ฟเวอร์

const port = process.env.PORT || 3000;

sequelize.sync()
    .then(() => {
        app.listen(port, () => console.log(`listening on port ${port}...`));
    })
    .catch(err => console.error('Error syncing with the database:', err));
