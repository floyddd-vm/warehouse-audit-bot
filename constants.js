const remarkTypes = {
  'Чистота': ['Наличие мусора на складе / доках', 'Пыльный товар в зоне отбора', 'Грязные полы: разливы, рассыпан груз, земля', 'Скотч/Стрейч не на своем месте', 'Пустые коробки в зоне отбора', 'Пустые поддоны в зоне хранения (в том числе поддон на поддоне)', 'Уборочный/ рабочий инвентарь оставлен в неположенном месте', 'Посторонние предметы на складе', 'Захламление зоны хранения поддонов / зона мусора', 'Мокрый пол', 'Пыль/грязь на поверхностях', 'загрязненные стеллажи'],
  'Безопасность': ['Техника оставлена в неположенном месте', 'Работники без жилетов', 'Посетители склада и работники в несоответствующей одежде, в т.ч. капюшоне', 'Нарушение правил эксплуатации техники', 'Заставлены пожарные шкафы/пожарные выходы, нет доступа к огнетушителю', 'Нарушена пломба на пожарном шкафу, на двери эвакуционного выхода', 'Плохая освещенность', 'Опасное расположение груза на стеллаже (выступы поддона вне допустимых пределах)', 'Разговоры по телефону во время выполнения складских операций и использование наушников', 'Заставлены пешеходные дорожки', 'Нет сигнальных знаков в спец. местах'],
  'Товар': ['Нарушена целостность упаковки товара', 'Некорректное расположение товара на поддоне (товар свисает)', 'Товар без поддона', 'Товар поврежден (протечка, бой)', 'На товаре отсутствует маркировка'],
  'Учет товара': ['Нарушение считываемости штрих-кода, адреса ячейки', 'Несоответствие количества товара система/факт', 'После приёмки груз не был перемещен в ячейку в течении суток', 'некорректно нанесен ID груза', 'некорректная маркировка ячеек, зон', 'незавершенные работы по солво'],
  'Стеллажи, техника': ['Поврежден стеллаж, замятие балки, диагонали, стойки', 'Наличие наклеек на технике, стеллажном оборудовании (скотч)', 'Сломан отбойник'],
  'Эффективность использования рабочего места': ['Переполнение зоны STOL ("просрочка"> мес.)', 'Нижние ячейки заняты неликвидным грузом', 'Сборка заказа вне отведенных для этого рядах', 'Захламление рабочих зон', 'Заставлена зона приемки/отгрузки старыми грузами (более 24ч)'],
  'Условия хранения': ['Нарушения товарного соседства', 'Протечки крыши, стен, доков, труб', 'Повреждение полов, стен', 'Обнаружение насекомых, грызунов', 'Температура выходит за диапазон от +15 до +25, влажность свыше 60%', 'Товар хранится на сломанных поддонах', 'Открытые ворота без присмотра', 'Нахождение груза у ворот более 3 дней', 'Товар хранится на хозяйственных грузах', 'Хозяйственные грузы хранятся не за раскосами', 'Нарушена эффективность размещения грузов']
};

const getMenuKeyboard = (options) => {
  return {
    reply_markup: {
      // добавлять к кнопкам назад в главное меню
      keyboard: options.map(option => [{ text: option }]).concat([[{ text: 'Назад в главное меню' }]]),
      //keyboard: options.map(option => [{ text: option }]) ,
      one_time_keyboard: true,
    },
  };
};

module.exports = {
  remarkTypes,
  getMenuKeyboard,
};

