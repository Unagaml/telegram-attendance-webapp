
// Инициализация Telegram Web Apps
const tg = window.Telegram.WebApp;
tg.expand();

// Получаем данные пользователя (при отсутствии — симуляция)
const user = tg.initDataUnsafe.user || { id: 111111, first_name: "Иван", last_name: "Иванов" };
const fullName = user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
const telegramId = user.id;

// Определяем, к какой группе принадлежит пользователь
let currentGroup = null;
if (productionGroup.members.some(member => member.telegramId === telegramId)) {
  currentGroup = productionGroup;
} else if (testGroup.members.some(member => member.telegramId === telegramId)) {
  currentGroup = testGroup;
} else {
  document.body.innerHTML = `
    <div style="text-align: center; margin-top: 50px;">
      <h1>Доступ запрещён</h1>
      <p>Ваш аккаунт не имеет доступа к этому сайту.</p>
    </div>
  `;
  throw new Error("Access denied");
}

// Глобальные переменные текущей группы
const GROUP_MEMBERS = currentGroup.members;
const groupId = currentGroup.id;
const schedule_week1 = currentGroup.schedule_week1;
const schedule_week2 = currentGroup.schedule_week2;

// Отображение даты и номера группы
function displayCurrentDateAndGroup() {
  const now = new Date();
  const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const dayName = days[now.getDay()];
  const dateNum = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  document.getElementById("currentDate").textContent = `Сегодня: ${dateNum} ${monthName} ${year}, ${dayName}`;
  document.getElementById("groupInfo").textContent = `Группа: ${groupId}`;
}
displayCurrentDateAndGroup();
