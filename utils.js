const ExcelJS = require('exceljs');
const { Remark } = require('./db');


async function generateReport() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Remarks');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Адрес ячейки', key: 'cellAddress', width: 20 },
    { header: 'Тип замечания', key: 'remarkType', width: 30 },
    { header: 'Подтип замечания', key: 'remarkSubtype', width: 30 },
    { header: 'Комментарий', key: 'comment', width: 40 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Дата создания', key: 'createdAt', width: 20 },
    { header: 'Дата обновления', key: 'updatedAt', width: 20 },
    { header: 'Пользователь', key: 'userId', width: 20 },
  ];

  const remarks = await Remark.findAll();

  remarks.forEach(remark => {
    worksheet.addRow(remark.toJSON());
  });

  const filePath = `/tmp/remarks_${Date.now()}.xlsx`;
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

module.exports = {
  generateReport,
};
