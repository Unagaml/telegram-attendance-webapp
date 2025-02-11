// Режим обслуживания: установите true, если сайт на обслуживании
const maintenanceMode = false;
if (maintenanceMode) {
  document.body.innerHTML = `
    <div style="text-align: center; margin-top: 50px;">
      <h1>Сайт временно закрыт на обслуживание</h1>
      <p>Пожалуйста, зайдите позже.</p>
    </div>
  `;
  // Прерываем дальнейшее выполнение скриптов
  throw new Error("Maintenance mode enabled");
}

// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRy07oPsvkEMglVsYgl4eYwEqe_Ha6hBk",
  authDomain: "telegramattendanceproject.firebaseapp.com",
  projectId: "telegramattendanceproject",
  storageBucket: "telegramattendanceproject.firebasestorage.app",
  messagingSenderId: "187275923015",
  appId: "1:187275923015:web:dab6c5d859c994e41e6b62",
  measurementId: "G-4T32BV5ZP2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* Определение групп */

// Продакшн-группа
const productionGroup = {
  id: "10114124",
  members: [
    { telegramId: 927092679, name: "Иванов Егор" },
    { telegramId: 5299194206, name: "Хацкевич Влад" },
    { telegramId: 1874576256, name: "Сыс Кирилл" },
    { telegramId: 1055899565, name: "Грак Богдан" },
    { telegramId: 802486943, name: "Урбан Артур" },
    { telegramId: 1229601518, name: "Левченко Егор" },
    { telegramId: 1290930048, name: "Куприк Влад" },
    { telegramId: 1399296785, name: "Лойко Егор" },
    { telegramId: 1160372409, name: "Мархель Егор" },
    { telegramId: 1095759616, name: "Метелица Зарина" },
    { telegramId: 1286590440, name: "Цалко Ксения" },
    { telegramId: 1486592466, name: "Башлыкова Анна" },
    { telegramId: 690914825, name: "Гаврилович Захар" },
    { telegramId: 5300094240, name: "Рыбак Татьяна" },
    { telegramId: 6748017272, name: "Тарасов Петр" },
    { telegramId: 946076143, name: "Якович Яна" },
    { telegramId: 1028263877, name: "Фомин Константин" },
    { telegramId: 5102007037, name: "Соколовский Евгений" },
    { telegramId: 1200327387, name: "Савастюк Илья" },
    { telegramId: 854046654, name: "Леднев Матвей" },
    { telegramId: 945548811, name: "Ярош Александр" },
    { telegramId: 1021548740, name: "Дроздов Владислав" },
    { telegramId: 1350118529, name: "Матющенков Станислав" },
    { telegramId: 6305094965, name: "Махранков Кирилл" },
    { telegramId: 2068500305, name: "Малиновский Егор" },
    { telegramId: 1164830732, name: "Ботвинников Артем" }
  ],
  schedule_week1: {
    "Понедельник": ["Математика практ.", "Математика лекция", "Физика Л/Р"],
    "Вторник": ["ОКТ лекция", "Английский", "ИГ"],
    "Среда": ["Физкультура", "Информатика Л/Р"],
    "Четверг": ["ОКТ практика", "Физика лекция", "Информатика лекция", "Китайский практика"],
    "Пятница": ["Английский", "Физика лекция", "Физика практ.", "Китайский практ."],
    "Суббота": ["Физкультура"]
  },
  schedule_week2: {
    "Понедельник": ["Математика практ.", "Математика лекция", "Кураторский час"],
    "Вторник": ["ОКТ лекция", "Английский", "ИГ"],
    "Среда": ["Физкультура", "Современная политэкономия лекция", "Информатика Л/Р"],
    "Четверг": ["Китайский практ.", "Физика лекция", "Информатика лекция", "Китайский практика 2"],
    "Пятница": ["Современная политэкономия практ.", "Математика лекция", "Математика практ.", "Китайский практ."],
    "Суббота": ["Физкультура"]
  }
};

// Тестовая группа
const testGroup = {
  id: "10114124_test",
  members: [
    { telegramId: 11111111, name: "Тестовый Пользователь 1" },
    { telegramId: 22222222, name: "Тестовый Пользователь 2" },
    { telegramId: 33333333, name: "Тестовый Пользователь 3" }
  ],
  schedule_week1: {
    "Понедельник": ["Тестовый предмет 1", "Тестовый предмет 2"],
    "Вторник": ["Тестовый предмет 3", "Тестовый предмет 4"],
    "Среда": ["Тестовый предмет 5"],
    "Четверг": ["Тестовый предмет 6", "Тестовый предмет 7"],
    "Пятница": ["Тестовый предмет 8"],
    "Суббота": ["Тестовая физкультура"]
  },
  schedule_week2: {
    "Понедельник": ["Тестовый предмет A", "Тестовый предмет B"],
    "Вторник": ["Тестовый предмет C"],
    "Среда": ["Тестовый предмет D", "Тестовый предмет E"],
    "Четверг": ["Тестовый предмет F"],
    "Пятница": ["Тестовый предмет G", "Тестовый предмет H"],
    "Суббота": ["Тестовая физкультура"]
  }
};
