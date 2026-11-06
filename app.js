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

// 2. Функция добавления карточки публикации в список 
function renderPost(post) {
  const li = document.createElement("li");

  const h3 = document.createElement("h3");
  h3.textContent = post.title;   // кладем внутр h3 текст заголова публикации

  const p = document.createElement("p");
  p.textContent = post.body;     // текст публикации

  li.appendChild(h3); // вкладываем h3 внутр li 
  li.appendChild(p); // вкладываем p внутр li 

  postsList.appendChild(li);     // добавляем <li> в <ul>, то есть страницу
}

// Функция асинхронная, загрузка публикаций (GET)
async function loadPosts() {
  showStatus("Загрузка...");  // показываем пользователю сообщение, о том, что происходит
  loadBtn.disabled = true;        // блокируем кнопку, чтобы не нажать дважды, пока идет запрос
  postsList.textContent = "";     // очищаем старый список перед новой загрузкой

  // то что может завершиться ошибкой
  try {
    // fetch(GET_URL) оправляет запрос методом GET, на указаный адрес. fetch сразу возращает Promise
    // await означает подождать пока это не завершится, но во время нее страница не замораживается, она работает
    // после выполнение вернятся элемент Response содержащий статус, заголовок и тело
    const response = await fetch(GET_URL);

    // fetch НЕ считает 404/500 ошибкой, поэтому проверяем сами
    // response.ok свойство true, если статус в диапазоне 200-299, иначе false
    if (!response.ok) {
      throw new Error("Ошибка сервера: " + response.status); // при ошибке throw немедленно прерывает выполнение блока и переходит к catch
    }

    // Читаем тело ответа и делает его как json, возращаем promise
    const posts = await response.json();

    // Проверяем есть ли данные в массиве, если данных нет, выводим отдельное сообщение
    if (posts.length === 0) {
      showStatus("Публикаций нет");
      return;                    
    }

    // Выводим каждую публикацию на страницу, если они есть, forEach для каждого элемента массива
    posts.forEach(function (post) {
      renderPost(post);  // создаем li и добавляем в список
    });

    showStatus("Загружено публикаций: " + posts.length);
  } catch (error) {  // ошибки ловим
    // Сюда попадают и сетевые ошибки, и наша ошибка из response.ok
    showStatus("Не удалось загрузить данные: " + error.message, true);
  } finally { // выполняет всегда 
    // Снова включаем кнопку для повторной попытки
    loadBtn.disabled = false;
  }
}

// Обработчик клика по кнопке загрузки
loadBtn.addEventListener("click", loadPosts);

// Создание публикации (POST)
postForm.addEventListener("submit", async function (event) {
  event.preventDefault();   // отменяем стандартную перезагрузку страницы

  // Валидация формы
  // Убираем пробелы по краям
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Если поля не пустые и не из одних пробелов
  if (title === "" || body === "") {
    showStatus("Заполните заголовок и текст публикации", true);
    return;                 // запрос не отправляем, так как ошибка
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
      body: JSON.stringify({        // превращаем js объект в строку json          
        title: title,
        body: body,
        userId: 1
      })
    });

    // Проверяем статус ответа, не блокирую страницу
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
  } catch (error) {  // ошибки
    showStatus("Не удалось создать публикацию: " + error.message, true);
  } finally {  // выполняет всегда
    // Кнопка снова активна в любом случае
    createBtn.disabled = false;
  }
});