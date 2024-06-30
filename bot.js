require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { handleStart, handleRemarkCreation, handleRemarkStatusChange, handleDownloadReport } = require('./handlers');
const { User } = require('./db');

function startPolling() {


  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

  bot.onText(/\/start/, (msg) => handleStart(bot, msg));

  bot.on('message', async (msg) => {
    const chatId = String(msg.chat.id); // Приведение chatId к строке
    const text = msg.text;

    let user = await User.findOne({ where: { chatId } });
    if (!user) {
      user = await User.create({ username: msg.from.username || msg.from.first_name || "test", chatId });
    }

    if( text === 'Назад в главное меню') {
      await user.update({ currentStep: 0 });
      handleStart(bot, msg);
    } else if (text === 'Начать осмотр') {
      await user.update({ currentStep: 1 });
      handleRemarkCreation(bot, msg, user);
    } else if (text === 'Изменить статус замечания') {
      await user.update({ currentStep: 7 });
      handleRemarkStatusChange(bot, msg, user);
    } else if (text === 'Скачать отчет') {
      handleDownloadReport(bot, chatId);
    } else if (user.currentStep > 0) {
      if (user.currentStep < 7) {
        handleRemarkCreation(bot, msg, user);
      } else {
        handleRemarkStatusChange(bot, msg, user);
      }
    }
  });

  // Обработчик ошибок поллинга
  bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
    console.error('Fatal polling error detected. Restarting polling...');
      bot.stopPolling()
        .then(() => startPolling())
        .catch(err => {
          console.error('Error while restarting polling:', err);
          process.exit(1); 
        });
  });
}


startPolling();