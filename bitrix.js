const axios = require('axios');

module.exports = {
    sendToBitrix24: async ({date, location, address, remarkType, remarkSubtype, comment}) => {
        // Здесь происходит отправка данных в Битрикс24
        const url = process.env.BITRIX24_WEBHOOK_URL + '/crm.item.add';
        //console.log({photoBase64});

        const entityTypeId = 1112;
        const createdBy = 41; // Яна
        const assignedById = 183; //Антон

        const fields = {
            ufCrm14_1748522003062: date,
            ufCrm14_1748523910194: location,
            ufCrm14_1748524067745: address,
            ufCrm14_1748524005506: remarkType,
            ufCrm14_1748523232636: remarkSubtype,
            ufCrm14_1748524167657: comment,
            assignedById,
        };

        console.log({fields});
        
        try {
            const response = await axios.post(url, {fields, entityTypeId, createdBy, assignedById});
            console.log('Задача добавлена', response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка при добавлении задачи:', error);
        }
    },
}
