// Функция отправки всех отметок (пользователь может отправить данные только один раз в день)
function sendAllAttendance() {
  const sendButton = document.getElementById('sendAttendanceBtn');
  if (sendButton.disabled) return;
  sendButton.disabled = true;
  
  const todayStr = new Date().toISOString().split("T")[0];

  // Проверяем, отправлял ли пользователь данные сегодня
  db.collection("attendance")
    .where("telegramId", "==", telegramId)
    .where("date", "==", todayStr)
    .get()
    .then(querySnapshot => {
      if (!querySnapshot.empty) {
        alert("Вы уже отправили данные за сегодня.");
        return;
      } else {
        // Проверяем, что для каждого предмета выбран ответ
        for (let subject of todaySchedule) {
          if (!attendanceSelections[subject]) {
            alert("Пожалуйста, выберите отметку для " + subject);
            sendButton.disabled = false;
            return;
          }
        }
        // Отправляем данные для каждого предмета с уникальным ID
        let promises = [];
        todaySchedule.forEach(subject => {
          const status = attendanceSelections[subject];
          const docId = `${telegramId}_${todayStr}_${subject}`;
          promises.push(
            db.collection("attendance").doc(docId).set({
              telegramId,
              name: fullName,
              subject,
              status,
              date: todayStr
            }, { merge: true })
          );
        });
        return Promise.all(promises);
      }
    })
    .then(() => {
      document.getElementById('result').textContent = "Все отметки успешно отправлены.";
    })
    .catch(error => {
      document.getElementById('result').textContent = `Ошибка: ${error}`;
      sendButton.disabled = false;
    });
}
document.getElementById('sendAttendanceBtn').onclick = sendAllAttendance;

// Функция формирования отчёта по отсутствующим по предметам
function showSubjectReport() {
  const todayStr = new Date().toISOString().split("T")[0];
  let reportHTML = `<h2>Отчёт по отсутствующим по предметам (${todayStr})</h2>`;
  const promises = todaySchedule.map(subject => {
    return db.collection("attendance")
      .where("date", "==", todayStr)
      .where("subject", "==", subject)
      .where("status", "!=", "присутствовал")
      .get()
      .then(querySnapshot => {
        let listItems = "";
        querySnapshot.forEach(doc => {
          const data = doc.data();
          listItems += `<li>${data.name} (ID: ${data.telegramId}) — ${data.status}</li>`;
        });
        if (listItems) {
          reportHTML += `<div style="border:1px solid #888; padding:10px; margin:10px 0;">
            <h3>${subject}</h3>
            <ul>${listItems}</ul>
          </div>`;
        } else {
          reportHTML += `<div style="border:1px solid #888; padding:10px; margin:10px 0;">
            <h3>${subject}</h3>
            <p>Все отписались или отсутствующих нет.</p>
          </div>`;
        }
      });
  });
  Promise.all(promises).then(() => {
    // Дополнительная секция: студенты, вообще не отписавшиеся
    db.collection("attendance")
      .where("date", "==", todayStr)
      .get()
      .then(querySnapshot => {
        const allSubmittedIds = new Set();
        querySnapshot.forEach(doc => {
          allSubmittedIds.add(doc.data().telegramId);
        });
        let globalMissing = [];
        GROUP_MEMBERS.forEach(member => {
          if (!allSubmittedIds.has(member.telegramId)) {
            globalMissing.push(member);
          }
        });
        if (globalMissing.length > 0) {
          reportHTML += `<div style="border:1px dashed #e53935; padding:10px; margin:10px 0;">
            <h3>Студенты, не отписавшиеся вообще:</h3>
            <ul>`;
          globalMissing.forEach(member => {
            reportHTML += `<li>${member.name} (ID: ${member.telegramId})</li>`;
          });
          reportHTML += "</ul></div>";
        }
        document.getElementById('report').innerHTML = reportHTML;
      })
      .catch(error => {
        document.getElementById('report').textContent = `Ошибка при получении глобальных данных: ${error}`;
      });
  });
}

// Функция формирования дневного отчёта
function showDailyReport() {
  const todayStr = new Date().toISOString().split("T")[0];
  db.collection("attendance")
    .where("date", "==", todayStr)
    .get()
    .then(querySnapshot => {
      const studentRecords = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!studentRecords[data.telegramId]) {
          studentRecords[data.telegramId] = { name: data.name, records: {} };
        }
        studentRecords[data.telegramId].records[data.subject] = data.status;
      });
      let reportHTML = `<h2>Дневной отчёт (${todayStr})</h2>`;
      GROUP_MEMBERS.forEach(member => {
        reportHTML += `<div style="border:1px solid #888; padding:10px; margin:10px 0;">`;
        reportHTML += `<h3>${member.name} (ID: ${member.telegramId})</h3>`;
        const rec = studentRecords[member.telegramId];
        if (rec) {
          reportHTML += "<ul>";
          todaySchedule.forEach(subject => {
            const response = rec.records[subject] || "не отправлено";
            reportHTML += `<li>${subject}: ${response}</li>`;
          });
          reportHTML += "</ul>";
        } else {
          reportHTML += `<p>Студент не отписался за сегодняшний день.</p>`;
        }
        reportHTML += "</div>";
      });
      let globalMissing = GROUP_MEMBERS.filter(member => !studentRecords[member.telegramId]);
      if (globalMissing.length > 0) {
        reportHTML += `<div style="border:1px dashed #e53935; padding:10px; margin:10px 0;">
            <h3>Студенты, не отправившие вообще:</h3>
            <ul>`;
        globalMissing.forEach(member => {
          reportHTML += `<li>${member.name} (ID: ${member.telegramId})</li>`;
        });
        reportHTML += "</ul></div>";
      }
      document.getElementById('report').innerHTML = reportHTML;
    })
    .catch(error => {
      document.getElementById('report').textContent = `Ошибка при формировании дневного отчёта: ${error}`;
    });
}

// Функция формирования недельного отчёта
function showWeeklyReport() {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mondayStr = monday.toISOString().split("T")[0];
  const sundayStr = sunday.toISOString().split("T")[0];

  db.collection("attendance")
    .where("date", ">=", mondayStr)
    .where("date", "<=", sundayStr)
    .get()
    .then(querySnapshot => {
      const studentRecords = {};
      querySnapshot.forEach(doc => {
        const data = doc.data();
        if (!studentRecords[data.telegramId]) {
          studentRecords[data.telegramId] = { name: data.name, records: [] };
        }
        studentRecords[data.telegramId].records.push({
          date: data.date,
          subject: data.subject,
          status: data.status
        });
      });
      let reportHTML = `<h2>Недельный отчёт (${mondayStr} - ${sundayStr})</h2>`;
      GROUP_MEMBERS.forEach(member => {
        reportHTML += `<div style="border:1px solid #888; padding:10px; margin:10px 0;">`;
        reportHTML += `<h3>${member.name} (ID: ${member.telegramId})</h3>`;
        const rec = studentRecords[member.telegramId];
        if (rec && rec.records.length > 0) {
          rec.records.sort((a, b) => a.date.localeCompare(b.date));
          reportHTML += "<ul>";
          rec.records.forEach(r => {
            reportHTML += `<li>${r.date} – ${r.subject}: ${r.status}</li>`;
          });
          reportHTML += "</ul>";
        } else {
          reportHTML += `<p>Студент не отписывался за неделю.</p>`;
        }
        reportHTML += "</div>";
      });
      let globalMissing = GROUP_MEMBERS.filter(member => !studentRecords[member.telegramId]);
      if (globalMissing.length > 0) {
        reportHTML += `<div style="border:2px dashed #e53935; padding:10px; margin:10px 0;">
          <h3>Студенты, не отписывавшиеся вообще за неделю:</h3>
          <ul>`;
        globalMissing.forEach(member => {
          reportHTML += `<li>${member.name} (ID: ${member.telegramId})</li>`;
        });
        reportHTML += "</ul></div>";
      }
      document.getElementById('report').innerHTML = reportHTML;
    })
    .catch(error => {
      document.getElementById('report').textContent = `Ошибка при формировании недельного отчёта: ${error}`;
    });
}

// Пример функции для показа списка не отписавшихся (если требуется)
function showMissingSubmissions() {
  const todayStr = new Date().toISOString().split("T")[0];
  db.collection("attendance")
    .where("date", "==", todayStr)
    .get()
    .then(querySnapshot => {
      const submittedIds = new Set();
      querySnapshot.forEach(doc => {
        submittedIds.add(doc.data().telegramId);
      });
      let missingMembers = GROUP_MEMBERS.filter(member => !submittedIds.has(member.telegramId));
      let reportHTML = `<h2>Список не отписавшихся (${todayStr})</h2>`;
      if (missingMembers.length > 0) {
        reportHTML += "<ul>";
        missingMembers.forEach(member => {
          reportHTML += `<li>${member.name} (ID: ${member.telegramId})</li>`;
        });
        reportHTML += "</ul>";
      } else {
        reportHTML += "<p>Все отписались.</p>";
      }
      document.getElementById('report').innerHTML = reportHTML;
    })
    .catch(error => {
      document.getElementById('report').textContent = `Ошибка при получении данных: ${error}`;
    });
}
