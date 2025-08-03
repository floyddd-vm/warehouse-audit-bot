const axios = require('axios');
const { convertImageToBase64 } = require('./image.js');

module.exports = {
    sendToBitrix24: async ({date, location, address, remarkType, remarkSubtype, comment}) => {
        // Здесь происходит отправка данных в Битрикс24
        const url = process.env.BITRIX24_WEBHOOK_URL + '/crm.item.add';
        //console.log({photoBase64});
        const fields = {
            ufCrm14_1748522003062: date,
            ufCrm14_1748523910194: location,
            ufCrm14_1748524067745: address,
            ufCrm14_1748524005506: remarkType,
            ufCrm14_1748523232636: remarkSubtype,
            ufCrm14_1748524167657: comment,      
        };

        console.log({fields});
        const entityTypeId = 1112;
        const createdBy = 1;
        const assignedById = 1;
        try {
            const response = await axios.post(url, {fields, entityTypeId, createdBy, assignedById});
            console.log('Задача добавлена', response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error);
        }
    },
}
