import React from 'react'
import './style.css'

function App() {
  return (
    <div className="page">
      <header className="header">
        <h1>🐍 Django REST API</h1>
        <p>Простой проект с GET, POST, PUT запросами. Данные в JSON-файле.</p>
      </header>

      <main className="content">
        <section>
          <h2>📋 Описание</h2>
          <p>Минимальный Django REST API с тремя HTTP методами:</p>
          <ul>
            <li><strong>GET</strong> — получение данных</li>
            <li><strong>POST</strong> — создание записи</li>
            <li><strong>PUT</strong> — обновление записи</li>
          </ul>
          <p>Данные хранятся в JSON-файле (без базы данных).</p>
        </section>

        <section>
          <h2>🚀 Установка и запуск</h2>
          <pre><code>pip install django
django-admin startproject myproject
cd myproject
python manage.py startapp api
python manage.py runserver</code></pre>
        </section>

        <section>
          <h2>📁 Структура проекта</h2>
          <pre><code>myproject/
├── manage.py
├── myproject/
│   ├── settings.py
│   └── urls.py
└── api/
    ├── views.py
    ├── urls.py
    └── data.json</code></pre>
        </section>

        <section>
          <h2>📝 Код</h2>

          <h3>api/views.py</h3>
          <pre><code>{`import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')

def read_data():
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def items_list(request):
    if request.method == 'GET':
        data = read_data()
        return JsonResponse({'items': data, 'count': len(data)})

    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Невалидный JSON'}, status=400)

        if 'name' not in body:
            return JsonResponse({'error': 'Поле "name" обязательно'}, status=400)

        data = read_data()
        new_id = max([item['id'] for item in data], default=0) + 1

        new_item = {
            'id': new_id,
            'name': body['name'],
            'description': body.get('description', ''),
        }
        data.append(new_item)
        write_data(data)
        return JsonResponse(new_item, status=201)

@csrf_exempt
@require_http_methods(["GET", "PUT"])
def item_detail(request, item_id):
    data = read_data()
    item = next((i for i in data if i['id'] == item_id), None)

    if request.method == 'GET':
        if item is None:
            return JsonResponse({'error': 'Не найдена'}, status=404)
        return JsonResponse(item)

    elif request.method == 'PUT':
        if item is None:
            return JsonResponse({'error': 'Не найдена'}, status=404)
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Невалидный JSON'}, status=400)

        if 'name' in body:
            item['name'] = body['name']
        if 'description' in body:
            item['description'] = body['description']
        write_data(data)
        return JsonResponse(item)`}</code></pre>

          <h3>api/urls.py</h3>
          <pre><code>{`from django.urls import path
from . import views

urlpatterns = [
    path('items/', views.items_list),
    path('items/<int:item_id>/', views.item_detail),
]`}</code></pre>

          <h3>myproject/urls.py</h3>
          <pre><code>{`from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]`}</code></pre>

          <h3>api/data.json</h3>
          <pre><code>{`[]`}</code></pre>
        </section>

        <section>
          <h2>🧪 Тестирование</h2>

          <h3>GET — получить все записи</h3>
          <pre><code>curl http://127.0.0.1:8000/api/items/</code></pre>
          <p>Ответ:</p>
          <pre><code>{`{"items": [], "count": 0}`}</code></pre>

          <h3>POST — создать запись</h3>
          <pre><code>{`curl -X POST http://127.0.0.1:8000/api/items/ \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Задача", "description": "Описание"}'`}</code></pre>
          <p>Ответ (201):</p>
          <pre><code>{`{"id": 1, "name": "Задача", "description": "Описание"}`}</code></pre>

          <h3>GET — получить одну запись</h3>
          <pre><code>curl http://127.0.0.1:8000/api/items/1/</code></pre>

          <h3>PUT — обновить запись</h3>
          <pre><code>{`curl -X PUT http://127.0.0.1:8000/api/items/1/ \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Обновлённая задача"}'`}</code></pre>
          <p>Ответ:</p>
          <pre><code>{`{"id": 1, "name": "Обновлённая задача", "description": "Описание"}`}</code></pre>
        </section>

        <section>
          <h2>📊 Схема API</h2>
          <table>
            <thead>
              <tr>
                <th>Метод</th>
                <th>URL</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge get">GET</span></td>
                <td><code>/api/items/</code></td>
                <td>Получить все записи</td>
              </tr>
              <tr>
                <td><span className="badge post">POST</span></td>
                <td><code>/api/items/</code></td>
                <td>Создать запись</td>
              </tr>
              <tr>
                <td><span className="badge get">GET</span></td>
                <td><code>/api/items/&lt;id&gt;/</code></td>
                <td>Получить одну запись</td>
              </tr>
              <tr>
                <td><span className="badge put">PUT</span></td>
                <td><code>/api/items/&lt;id&gt;/</code></td>
                <td>Обновить запись</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>🔑 Ключевые моменты</h2>
          <ul>
            <li><code>@csrf_exempt</code> — отключает CSRF для API</li>
            <li><code>@require_http_methods</code> — ограничивает HTTP методы</li>
            <li><code>request.body</code> — тело запроса, парсим JSON вручную</li>
            <li><code>data.json</code> — простое хранилище без БД</li>
            <li><code>JsonResponse</code> — ответ с <code>Content-Type: application/json</code></li>
          </ul>
        </section>

        <section>
          <h2>⚠️ Коды ошибок</h2>
          <table>
            <thead>
              <tr>
                <th>Код</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>400</td><td>Невалидный JSON или нет обязательного поля</td></tr>
              <tr><td>404</td><td>Запись не найдена</td></tr>
              <tr><td>405</td><td>Метод не разрешён</td></tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>📚 Ссылки</h2>
          <ul>
            <li><a href="https://docs.djangoproject.com/">Django документация</a></li>
            <li><a href="https://www.django-rest-framework.org/">Django REST Framework</a></li>
            <li><a href="https://developer.mozilla.org/ru/docs/Web/HTTP/Methods">HTTP методы (MDN)</a></li>
          </ul>
        </section>
      </main>

      <footer className="footer">
        <p>📄 Документация также в файле <code>django-docs.md</code></p>
      </footer>
    </div>
  )
}

export default App
