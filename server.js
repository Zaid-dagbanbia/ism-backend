import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.static('./public'));


app.use('/', router);


// database connection:
import { connect } from 'mongoose';
const connectionString = process.env.DB_URI;
connect(connectionString).then(() => console.log('DB Connect Successfully!')).catch(err => console.log('DB connection Failed!'));


const port = process.env.PORT || 3500;
app.listen(port, () => console.log('app is running on port:', port));