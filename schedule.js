// schedule.js

// Если пользователь является старостой, пропускаем отображение расписания
if (window.isLeader) {
  // Не создаём интерфейс отметок для старосты
  // Можно также очистить контейнер:
  document.getElementById('schedule').innerHTML = "";
  // И выйти из скрипта:
  return;
}

// Функция определения, какая неделя (1-я или 2-я)
function isWeek1() {
  const refDate = new Date(2025, 1, 10); // 10 февраля 2025
  const today = new Date();
  const deltaDays = Math.floor((today - refDate) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(deltaDays / 7);
  return weekNumber % 2 !== 0;
}

// Функция получения расписания на сегодня
function getTodaySchedule() {
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  const currentDay = new Date().getDay();
  const index = currentDay === 0 ? 6 : currentDay - 1;
  const weekSchedule = isWeek1() ? schedule_week1 : schedule_week2;
  return weekSchedule[days[index]] || [];
}

const todaySchedule = getTodaySchedule();

// Глобальный объект для хранения отметок пользователя
let attendanceSelections = {};

// Функция выделения выбранной кнопки (также используется в reports.js)
function highlightSelection(container, selectedButton) {
  Array.from(container.children).forEach(btn => btn.classList.remove('selected'));
  selectedButton.classList.add('selected');
}

// Отображение карточек с расписанием
const scheduleDiv = document.getElementById('schedule');
todaySchedule.forEach(subject => {
  const subjectDiv = document.createElement('div');
  subjectDiv.className = 'subject';
  subjectDiv.innerHTML = `<h3>${subject}</h3>`;
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'buttons';

  const resultText = document.createElement('p');
  resultText.className = 'selection-result';
  resultText.textContent = "Ваш выбор:";

  // Кнопка "Прикрыть:)"
  const btnPresent = document.createElement('button');
  btnPresent.textContent = 'Прикрыть';
  btnPresent.onclick = () => {
    attendanceSelections[subject] = 'присутствовал';
    highlightSelection(buttonsDiv, btnPresent);
    resultText.textContent = "Ваш выбор: присутствовал";
    btnPresent.classList.add('pulse');
    setTimeout(() => btnPresent.classList.remove('pulse'), 500);
  };
  buttonsDiv.appendChild(btnPresent);

  // Кнопка "Не буду (уважительная причина)"
  const btnAbsentValid = document.createElement('button');
  btnAbsentValid.textContent = 'Не буду (уважительная причина)';
  btnAbsentValid.onclick = () => {
    attendanceSelections[subject] = 'отсутствовал (уважительная причина)';
    highlightSelection(buttonsDiv, btnAbsentValid);
    resultText.textContent = "Ваш выбор: отсутствовал (уважительная причина)";
    btnAbsentValid.classList.add('pulse');
    setTimeout(() => btnAbsentValid.classList.remove('pulse'), 500);
  };
  buttonsDiv.appendChild(btnAbsentValid);

  // Кнопка "Не буду (неуважительная причина)"
  const btnAbsentInvalid = document.createElement('button');
  btnAbsentInvalid.textContent = 'Не буду (неуважительная причина)';
  btnAbsentInvalid.onclick = () => {
    attendanceSelections[subject] = 'отсутствовал (неуважительная причина)';
    highlightSelection(buttonsDiv, btnAbsentInvalid);
    resultText.textContent = "Ваш выбор: отсутствовал (неуважительная причина)";
    btnAbsentInvalid.classList.add('pulse');
    setTimeout(() => btnAbsentInvalid.classList.remove('pulse'), 500);
  };
  buttonsDiv.appendChild(btnAbsentInvalid);

  subjectDiv.appendChild(buttonsDiv);
  subjectDiv.appendChild(resultText);
  scheduleDiv.appendChild(subjectDiv);
});
