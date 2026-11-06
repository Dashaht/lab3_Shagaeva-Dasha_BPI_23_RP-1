// Адрес для загрузки публикаций (GET)
const GET_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";

// Адрес для создания публикации (POST)
const POST_URL = "https://jsonplaceholder.typicode.com/posts";

// Получаем элементы страницы по id
const loadBtn = document.getElementById("loadBtn");   // кнопка "Загрузить публикации"
const statusEl = document.getElementById("status");   // область сообщений
const postsList = document.getElementById("posts");   // список публикаций

const postForm = document.getElementById("postForm"); // форма создания
const titleInput = document.getElementById("title");  // поле "Заголовок"
const bodyInput = document.getElementById("body");    // поле "Текст"
const createBtn = document.getElementById("createBtn"); // кнопка "Создать публикацию"

// Вспомогательные функции

// 1. Функция показывающае сообщение пользователю
// Если isError = true, сообщение красное (ошибка), иначе зеленое (успех)
function showStatus(message, isError = false) {
  statusEl.textContent = message;                      // текст через textContent
  statusEl.style.color = isError ? "red" : "green";    // цвет сообщения
}

// 2. Функция создать <li> с заголовком и текстом публикации и добавить его в список
// Текст вставляем через textContent — данные пришли извне (безопасно)
function renderPost(post) {
  const li = document.createElement("li");

  const h3 = document.createElement("h3");
  h3.textContent = post.title;   // заголовок публикации

  const p = document.createElement("p");
  p.textContent = post.body;     // текст публикации

  li.appendChild(h3);
  li.appendChild(p);

  postsList.appendChild(li);     // добавляем <li> в <ul>
}

// Загрузка публикаций (GET)
async function loadPosts() {
  showStatus("Загрузка...");
  loadBtn.disabled = true;        // блокируем кнопку, чтобы не нажать дважды
  postsList.textContent = "";     // очищаем старый список

  try {
    // Ждём ответ сервера
    const response = await fetch(GET_URL);

    // fetch НЕ считает 404/500 ошибкой — проверяем сами
    if (!response.ok) {
      throw new Error("Ошибка сервера: " + response.status);
    }

    // Ждём чтение тела ответа как JSON
    const posts = await response.json();

    // Если данных нет — выводим отдельное сообщение
    if (posts.length === 0) {
      showStatus("Публикаций нет");
      return;                    
    }

    // Выводим каждую публикацию на страницу
    posts.forEach(function (post) {
      renderPost(post);
    });

    showStatus("Загружено публикаций: " + posts.length);
  } catch (error) {
    // Сюда попадают и сетевые ошибки, и наша ошибка из response.ok
    showStatus("Не удалось загрузить данные: " + error.message, true);
  } finally {
    // Выполняется всегда: снова включаем кнопку для повторной попытки
    loadBtn.disabled = false;
  }
}

// Обработчик клика по кнопке загрузки
loadBtn.addEventListener("click", loadPosts);

// Создание публикации (POST)

postForm.addEventListener("submit", async function (event) {
  event.preventDefault();   // отменяем стандартную перезагрузку страницы

  // Убираем пробелы по краям
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Валидация: если поля не пустые и не из одних пробелов
  if (title === "" || body === "") {
    showStatus("Заполните заголовок и текст публикации", true);
    return;                 // запрос не отправляем
  }

  showStatus("Отправка...");
  createBtn.disabled = true; // блокируем кнопку на время запроса

  try {
    // Отправляем POST-запрос с JSON в теле
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"   // сообщаем, что в теле JSON
      },
      body: JSON.stringify({                
        title: title,
        body: body,
        userId: 1
      })
    });

    // Проверяем статус ответа
    if (!response.ok) {
      throw new Error("Ошибка сервера: " + response.status);
    }

    // Читаем ответ сервера
    const data = await response.json();

    // Выводим заголовок и ID из ответа + сообщение об успехе
    showStatus("Публикация создана! ID: " + data.id + ". Заголовок: " + data.title);

    // Показываем новую публикацию в списке
    renderPost(data);

    // Очищаем форму
    postForm.reset();
  } catch (error) {
    showStatus("Не удалось создать публикацию: " + error.message, true);
  } finally {
    // Кнопка снова активна в любом случае
    createBtn.disabled = false;
  }
});