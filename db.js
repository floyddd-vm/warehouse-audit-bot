const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('warehouse', 'postgres', 'password', {
  host: 'localhost',
  port: process.env.BOT_DB_PORT,
  dialect: 'postgres',
});



sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  chatId: {
    type: DataTypes.STRING, // Приведение типа к строке
    allowNull: false,
    unique: true,
  },
  currentStep: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
});

const Remark = sequelize.define('Remark', {
  cellAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarkType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarkSubtype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comment: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'открыто',
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

sequelize.sync();

module.exports = {
  User,
  Remark,
  sequelize,
};