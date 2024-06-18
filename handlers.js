const { User, Remark } = require('./db');
const { generateReport } = require('./utils');
const { getMenuKeyboard, remarkTypes } = require('./constants');
const fs = require('fs');

const inspectionData = {}; // Объект для хранения данных осмотров

async function handleStart(bot, msg) {
  const chatId = String(msg.chat.id); // Приведение chatId к строке
  const username = msg.from.username;

  const [user, created] = await User.findOrCreate({
    where: { chatId },
    defaults: { username }
  });

  bot.sendMessage(chatId, 'Добро пожаловать! Выберите действие:', {
    reply_markup: {
      keyboard: [
        [{ text: 'Начать осмотр' }],
        [{ text: 'Изменить статус замечания' }],
        [{ text: 'Скачать отчет' }],
      ],
      one_time_keyboard: true,
    },
  });
}

async function handleRemarkCreation(bot, msg, user) {
  const chatId = String(msg.chat.id); // Приведение chatId к строке
  const text = msg.text;

  console.log(`Current step for user ${user.username}: ${user.currentStep}`);
  console.log(`Inspection data for chat ${chatId}:`, inspectionData[chatId]);

  if (!inspectionData[chatId]) {
    inspectionData[chatId] = {};
  }

  if (user.currentStep === 1) {
    await user.update({ currentStep: 2 });
    bot.sendMessage(chatId, 'Введите адрес ячейки:');
  } else if (user.currentStep === 2) {
    const openRemarks = await Remark.findAll({ where: { cellAddress: text, status: 'открыто' } });
    if (openRemarks.length > 0) {
      let remarksText = 'Существующие замечания для этой ячейки:\n';
      openRemarks.forEach((remark, index) => {
        remarksText += `${index + 1}. ${remark.remarkSubtype} - ${remark.comment}\n`;
      });
      remarksText += '\nВыберите одно из замечаний для изменения статуса или добавьте новое.';
      inspectionData[chatId] = { cellAddress: text, userId: user.id, existingRemarks: openRemarks };
      await user.update({ currentStep: 3 });
      bot.sendMessage(chatId, remarksText, {
        reply_markup: {
          keyboard: [
            [{ text: 'Добавить новое замечание' }],
            [{ text: 'Назад в главное меню' }]
          ],
          one_time_keyboard: true,
        },
      });
    } else {
      inspectionData[chatId] = { cellAddress: text, userId: user.id };
      await user.update({ currentStep: 3 });
      bot.sendMessage(chatId, 'Выберите тип замечания:', getMenuKeyboard(Object.keys(remarkTypes)));
    }
  } else if (user.currentStep === 3) {
    if (text === 'Добавить новое замечание') {
      await user.update({ currentStep: 4 });
      bot.sendMessage(chatId, 'Выберите тип замечания:', getMenuKeyboard(Object.keys(remarkTypes)));
    } else if (remarkTypes[text]) {
      inspectionData[chatId].remarkType = text;
      await user.update({ currentStep: 5 }); // Переход на шаг 5
      bot.sendMessage(chatId, 'Выберите подтип замечания:', {
        reply_markup: {
          keyboard: remarkTypes[text].map(subtype => [{ text: subtype }]).concat([[{ text: 'Назад' }]]),
          one_time_keyboard: true,
        },
      });
    } else if (text === 'Назад в главное меню') {
      await user.update({ currentStep: 0 });
      handleStart(bot, msg);
    } else {
      bot.sendMessage(chatId, 'Пожалуйста, выберите тип замечания из предложенных вариантов.');
    }
  } else if (user.currentStep === 4) {
    if (remarkTypes[text]) {
      inspectionData[chatId].remarkType = text;
      await user.update({ currentStep: 5 });
      bot.sendMessage(chatId, 'Выберите подтип замечания:', {
        reply_markup: {
          keyboard: remarkTypes[text].map(subtype => [{ text: subtype }]).concat([[{ text: 'Назад' }]]),
          one_time_keyboard: true,
        },
      });
    } else {
      bot.sendMessage(chatId, 'Пожалуйста, выберите тип замечания из предложенных вариантов.');
    }
  } else if (user.currentStep === 5) {
    if (Object.values(remarkTypes).flat().includes(text)) {
      inspectionData[chatId].remarkSubtype = text;
      await user.update({ currentStep: 6 });
      bot.sendMessage(chatId, 'Введите комментарий:');
    } else if (text === 'Назад') {
      await user.update({ currentStep: 4 });
      bot.sendMessage(chatId, 'Выберите подтип замечания:', {
        reply_markup: {
          keyboard: remarkTypes[inspectionData[chatId].remarkType].map(subtype => [{ text: subtype }]).concat([[{ text: 'Назад' }]]),
          one_time_keyboard: true,
        },
      });
    } else {
      bot.sendMessage(chatId, 'Пожалуйста, выберите подтип замечания из предложенных вариантов.');
    }
  } else if (user.currentStep === 6) {
    const { cellAddress, remarkType, remarkSubtype, userId } = inspectionData[chatId];
    console.log(`Saving remark: cellAddress=${cellAddress}, remarkType=${remarkType}, remarkSubtype=${remarkSubtype}, comment=${text}, userId=${userId}`);
    try {
      await Remark.create({ cellAddress, remarkType, remarkSubtype, comment: text, status: 'открыто', userId });
      bot.sendMessage(chatId, `Замечание сохранено:\nАдрес ячейки: ${cellAddress}\nТип: ${remarkType}\nПодтип: ${remarkSubtype}\nКомментарий: ${text}`);
      await user.update({ currentStep: 0 }); // Сброс текущего шага после завершения
      delete inspectionData[chatId]; // Очистка данных после завершения

      // Добавление кнопки "Начать осмотр" после завершения
      bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы начать новый осмотр или изменить статус другого замечания.', {
        reply_markup: {
          keyboard: [
            [{ text: 'Начать осмотр' }],
            [{ text: 'Изменить статус замечания' }],
            [{ text: 'Скачать отчет' }],
          ],
          one_time_keyboard: true,
        },
      });
    } catch (err) {
      bot.sendMessage(chatId, 'Ошибка при сохранении замечания. Попробуйте снова.');
      console.error('Error creating remark:', err);
    }
  }
}

async function handleRemarkStatusChange(bot, msg, user) {
  const chatId = String(msg.chat.id); // Приведение chatId к строке
  const text = msg.text;

  console.log(`Current step for user ${user.username}: ${user.currentStep}`);
  console.log(`Inspection data for chat ${chatId}:`, inspectionData[chatId]);

  if (!inspectionData[chatId]) {
    inspectionData[chatId] = {};
  }

  if (user.currentStep === 7) {
    await user.update({ currentStep: 8 });
    bot.sendMessage(chatId, 'Введите адрес ячейки:');
  } else if (user.currentStep === 8) {
    const openRemarks = await Remark.findAll({ where: { cellAddress: text, status: 'открыто' } });
    if (openRemarks.length > 0) {
      inspectionData[chatId] = { cellAddress: text, userId: user.id, existingRemarks: openRemarks };
      await user.update({ currentStep: 9 });
      bot.sendMessage(chatId, 'Выберите подтип замечания для изменения статуса:', {
        reply_markup: {
          keyboard: openRemarks.map((remark) => [{ text: remark.remarkSubtype }]).concat([[{ text: 'Назад в главное меню' }]]),
          one_time_keyboard: true,
        },
      });
    } else {
      bot.sendMessage(chatId, 'Нет открытых замечаний для этой ячейки.');
      await user.update({ currentStep: 0 });
      handleStart(bot, msg);
    }
  } else if (user.currentStep === 9) {
    const selectedRemark = inspectionData[chatId].existingRemarks.find(remark => remark.remarkSubtype === text);
    if (selectedRemark) {
      inspectionData[chatId].remarkId = selectedRemark.id;
      await user.update({ currentStep: 10 });
      bot.sendMessage(chatId, 'Выберите новый статус замечания:', getMenuKeyboard(['Исправлено', 'Не исправлено']));
    } else if (text === 'Назад в главное меню') {
      await user.update({ currentStep: 0 });
      handleStart(bot, msg);
    } else {
      bot.sendMessage(chatId, 'Пожалуйста, выберите подтип замечания из предложенных вариантов.');
    }
  } else if (user.currentStep === 10) {
    if (inspectionData[chatId] && inspectionData[chatId].remarkId) {
      const { remarkId } = inspectionData[chatId];
      try {
        if (text === 'Исправлено') {
          await Remark.update({ status: 'закрыто' }, { where: { id: remarkId } });
          bot.sendMessage(chatId, 'Замечание обновлено как "Исправлено".');
        } else if (text === 'Не исправлено') {
          await Remark.update({ status: 'открыто' }, { where: { id: remarkId } });
          bot.sendMessage(chatId, 'Замечание обновлено как "Не исправлено".');
        } else {
          bot.sendMessage(chatId, 'Пожалуйста, выберите статус из предложенных вариантов.');
          return;
        }
        await user.update({ currentStep: 0 });
        delete inspectionData[chatId]; // Очистка данных после завершения

        // Добавление кнопки "Начать осмотр" после завершения
        bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы начать новый осмотр или изменить статус другого замечания.', {
          reply_markup: {
            keyboard: [
              [{ text: 'Начать осмотр' }],
              [{ text: 'Изменить статус замечания' }],
              [{ text: 'Скачать отчет' }],
            ],
            one_time_keyboard: true,
          },
        });
      } catch (err) {
        bot.sendMessage(chatId, 'Ошибка при обновлении статуса замечания. Попробуйте снова.');
        console.error('Error updating remark status:', err);
      }
    } else {
      bot.sendMessage(chatId, 'Ошибка: не удалось найти данные замечания.');
      await user.update({ currentStep: 0 });
      handleStart(bot, msg);
    }
  }
}

async function handleDownloadReport(bot, chatId) {
  const filePath = await generateReport();
  bot.sendDocument(chatId, filePath)
    .then(() => {
      fs.unlinkSync(filePath); // Удаление файла после отправки
    })
    .catch(err => {
      bot.sendMessage(chatId, 'Ошибка при отправке отчета.');
      console.error('Error sending report:', err);
    });
}

module.exports = {
  handleStart,
  handleRemarkCreation,
  handleRemarkStatusChange,
  handleDownloadReport,
};
