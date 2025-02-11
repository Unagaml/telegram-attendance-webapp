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

// Определяем, является ли пользователь старостой
const isLeader = leaderIds.includes(telegramId);
window.isLeader = isLeader; // делаем доступным для других файлов

// Если пользователь — староста, скрываем интерфейс отметок
if (isLeader) {
  document.getElementById('schedule').style.display = "none";
  document.getElementById('sendContainer').style.display = "none";
}

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

// После загрузки страницы добавляем кнопки отчётов для старосты
window.addEventListener("load", function(){
  if (isLeader) {
    const reportContainer = document.getElementById('report');
    
    const reportSubjectsBtn = document.createElement('button');
    reportSubjectsBtn.textContent = "Показать отчёт по отсутствующим";
    reportSubjectsBtn.className = "report-btn";
    reportSubjectsBtn.onclick = showSubjectReport;
    document.body.insertBefore(reportSubjectsBtn, reportContainer);

    const missingBtn = document.createElement('button');
    missingBtn.textContent = "Показать список не отписавшихся";
    missingBtn.className = "report-btn";
    missingBtn.style.background = "#1b5e20";
    missingBtn.onclick = showMissingSubmissions;
    document.body.insertBefore(missingBtn, reportContainer);

    const dailyReportBtn = document.createElement('button');
    dailyReportBtn.textContent = "Сформировать отчёт за день";
    dailyReportBtn.className = "report-btn";
    dailyReportBtn.style.background = "#1565c0";
    dailyReportBtn.onclick = showDailyReport;
    document.body.insertBefore(dailyReportBtn, reportContainer);

    const weeklyReportBtn = document.createElement('button');
    weeklyReportBtn.textContent = "Сформировать недельный отчёт";
    weeklyReportBtn.className = "report-btn";
    weeklyReportBtn.style.background = "#0d47a1";
    weeklyReportBtn.onclick = showWeeklyReport;
    document.body.insertBefore(weeklyReportBtn, reportContainer);
  }
});
