// server.js
const express = require('express');
const cors = require('cors'); // Import the cors module
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:3000' })); // Set the origin to 'http://localhost:5000'

app.use(express.json());

mongoose.connect('mongodb+srv://hotel_manegment:ss333@cluster0.vv7hctc.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('Users', userSchema);
const feedbackSchema = new mongoose.Schema({
  description: String,
  rating: Number,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
    roomNo: { type: String, required: true },
    floorNo: { type: String, required: true },
    countOfUser: { type: Number, required: true },
    mobileNo: { type: String, required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } 
});

const Room = mongoose.model('Roomss', roomSchema);
const foodSchema = new mongoose.Schema({
  dishCategory: String,
  dishName: String,
  dishPrice: Number,
  dishImage: String,
  dishRating: String,
  quantity: Number
});

// Create a model based on the schem
const Food = mongoose.model('Food', foodSchema);
const employeeSchema = new mongoose.Schema({
  emp_id: { type: Number, required: true },
  empname: { type: String, required: true },
  phoneNumber: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  category: { type: String },
  salary: { type: Number },
  joiningdate: { type: String },
  gender: { type: String }
});

// Create the Employee model
const Employee = mongoose.model('Employee', employeeSchema);
const room1Schema = new mongoose.Schema({
  roomNo: Number,
  floorNo: Number,
  status: { type: String, enum: ['available', 'booked'], default: 'available' } 
});

const Rooms = mongoose.model('Roomlist', room1Schema);
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });  
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { description, rating } = req.body;
    const feedback = new Feedback({ description, rating });
    await feedback.save();
    res.status(201).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});
app.put('/:roomNo', async (req, res) => {
  try {
      const { roomNo } = req.params;
      const updatedRoom = await Rooms.findOneAndUpdate({ roomNo }, { status: 'available' }, { new: true });
      if (!updatedRoom) {
          return res.status(404).send({ error: 'Room not found' });
      }
      res.send(updatedRoom);
  } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Server error' });
  }
});
// app.post('/api/room', async (req, res) => {
//   try {
//     const newRoom = await Room.create(req.body);
//     await newRoom.save();
//     res.status(201).json(newRoom);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// app.get('/api/rooms', async (req, res) => {
//   try {
//     const rooms = await Room.find();
//     res.json(rooms);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// // });
// app.post('/rooms/book', async (req, res) => {
//   try {
//       const { name, roomNo, floorNo, countOfUser, mobileNo, checkInDate, checkOutDate } = req.body;
//       const newBooking = new Room({
//           name,
//           roomNo,
//           floorNo,
//           countOfUser,
//           mobileNo,
//           checkInDate,
//           checkOutDate,
//           status: 'pending' // Set initial status to pending
//       });
//       const savedBooking = await newBooking.save();
//       res.json(savedBooking);
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'An error occurred while booking the room.' });
//   }
// });
// app.put('/rooms/:id/status', async (req, res) => {
//   try {
//       const { id } = req.params;
//       const { status } = req.body;
//       const updatedRoom = await Room.findByIdAndUpdate(id, { status }, { new: true });
//       res.json(updatedRoom);
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({ error: 'An error occurred while updating room status.' });
//   }
// });
// app.put('/api/room/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const room = await Room.findById(id);

//     if (!room) {
//       return res.status(404).json({ message: 'Room not found' });
//     }

//     // Update the room data
//     room.set(req.body);
//     const updatedRoom = await room.save();

//     res.json(updatedRoom);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// app.delete('/api/room/:id', async (req, res) => {
//   const { id } = req.params.id;
//   try {
//     const deletedRoom = await Room.findOne(id);
//     if (!deletedRoom) {
//       return res.status(404).json({ message: 'Room not found' });
//     }
//      await deletedRoom.delete();
//     res.json({ message: 'Room deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
app.put('/api/rooms/:roomNo', async (req, res) => {
  const roomNo = req.params.roomNo;
  const { status } = req.body;

  try {
    // Find the room by room number and update its status
    const room = await Room.findOneAndUpdate({ roomNo }, { status }, { new: true });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.status(200).json(room);
  } catch (error) {
    console.error('Error updating room status:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;

  try {
      // Find the booking by _id and remove it from the database
      const deletedBooking = await Room.findByIdAndDelete(id);
      if (!deletedBooking) {
          return res.status(404).json({ error: 'Booking not found' });
      }

      res.status(200).json({ message: 'Booking deleted successfully', booking: deletedBooking });
  } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
// // app.put('/api/rooms/:roomId', (req, res) => {
// //     const roomId = req.params.roomId;
// //     // Logic to update room status in the database
// //     // Example:
// //     Room.findByIdAndUpdate(roomId, { status: 'booked' }, { new: true }, (err, updatedRoom) => {
// //         if (err) {
// //             console.error(err);
// //             res.status(500).json({ error: 'Internal Server Error' });
// //         } else {
// //             res.json(updatedRoom);
// //         }
// //     });
// // });
// // // PUT (update) a room by ID
app.put('/api/room/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRoom = await Rooms.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    await updatedRoom.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.put('/rooms/:roomId/book', async (req, res) => {
  const roomId = req.params.roomId;

  try {
      // Find the room by ID and update its status to 'booked'
      const updatedRoom = await Rooms.findByIdAndUpdate(roomId, { status: 'booked' }, { new: true });

      if (!updatedRoom) {
          return res.status(404).json({ error: 'Room not found' });
      }

      res.status(200).json({ message: 'Room status updated to booked', room: updatedRoom });
  } catch (error) {
      console.error('Error updating room status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.get('/api/rooms', async (req, res) => {
//   try {
//     const rooms = await Rooms.find({ status: 'available' });
//     res.json(rooms);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

// // Book a room
// app.post('/api/rooms/book', async (req, res) => {
//   try {
//     const { roomNo } = req.body;
//     const room = await Rooms.findOneAndUpdate(
//       { roomNo, status: 'available' },
//       { status: 'booked' },
//       { new: true }
//     );
//     if (!room) {
//       return res.status(404).json({ message: 'Room not available for booking' });
//     }
//     res.json({ message: 'Room booked successfully', room });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });
//RoomBookingForm
app.post('/rooms/book', async (req, res) => {
  try {
      const newBooking = new Room(req.body);
      const savedBooking = await newBooking.save();
      res.json(savedBooking);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
//RoomList
app.get('/rooms', async (req, res) => {
  try {
      const availableRooms = await Rooms.find({ status: 'available' });
      res.json(availableRooms);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
//GetRoomData
// Get all booked rooms
app.get('/rooms/booked', async (req, res) => {
  try {
      const bookedRooms = await Room.find({ status: { $in: ['approved', 'pending', 'rejected'] } });
      res.json(bookedRooms);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.put('/rooms/:roomId/status', async (req, res) => {
  const { roomId } = req.params;
  const { status } = req.body;
  try {
      const updatedRoom = await Room.findByIdAndUpdate(roomId, { status }, { new: true });
      res.json(updatedRoom);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/food', async (req, res) => {
  try {
    const foodItems = await Food.find();
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new food item
app.post('/api/food', async (req, res) => {
  const newFoodItem = new Food(req.body);
  try {
    const savedFoodItem = await newFoodItem.save();
    res.status(201).json(savedFoodItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// PUT (update) a food item by ID
app.put('/api/food/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedFoodItem = await Food.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedFoodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    await updatedFoodItem.save();
    res.json(updatedFoodItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a food item by ID
app.delete('/api/food/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFoodItem = await Food.findByIdAndDelete(id);
    if (!deletedFoodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }
    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all employees
app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an employee
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an employee
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
