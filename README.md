# Django REST API — Простой проект

## 📋 Описание

Минимальный Django REST API с тремя HTTP методами:
- **GET** — получение данных
- **POST** — создание записи
- **PUT** — обновление записи

Данные хранятся в JSON-файле (без базы данных).

---

## 🚀 Установка и запуск

### 1. Установка зависимостей

```bash
pip install django
```

### 2. Запуск сервера

```bash
python manage.py runserver
```

Сервер запустится на `http://127.0.0.1:8000/`

---

## 📁 Структура проекта

```
├── manage.py              # Утилита управления Django
├── requirements.txt       # Зависимости проекта
├── README.md              # Документация
├── myproject/
│   ├── __init__.py
│   ├── settings.py        # Настройки проекта
│   └── urls.py            # Корневые URL
└── api/
    ├── __init__.py
    ├── views.py           # Обработчики запросов
    ├── urls.py            # URL маршруты API
    └── data.json          # Хранилище данных
```

---

## 📝 Код проекта

### myproject/settings.py

```python
SECRET_KEY = 'django-insecure-simple-key-for-demo'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
]

MIDDLEWARE = []

ROOT_URLCONF = 'myproject.urls'

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
```

### myproject/urls.py

```python
from django.urls import path, include

urlpatterns = [
    path('api/', include('api.urls')),
]
```

### api/views.py

```python
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')


def read_data():
    """Чтение данных из JSON файла"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def write_data(data):
    """Запись данных в JSON файл"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def items_list(request):
    """
    GET  /api/items/ — получить все записи
    POST /api/items/ — создать новую запись
    """
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
    """
    GET /api/items/<id>/ — получить одну запись
    PUT /api/items/<id>/ — обновить запись
    """
    data = read_data()
    item = next((i for i in data if i['id'] == item_id), None)

    if request.method == 'GET':
        if item is None:
            return JsonResponse({'error': 'Запись не найдена'}, status=404)
        return JsonResponse(item)

    elif request.method == 'PUT':
        if item is None:
            return JsonResponse({'error': 'Запись не найдена'}, status=404)

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Невалидный JSON'}, status=400)

        if 'name' in body:
            item['name'] = body['name']
        if 'description' in body:
            item['description'] = body['description']

        write_data(data)
        return JsonResponse(item)
```

### api/urls.py

```python
from django.urls import path
from . import views

urlpatterns = [
    path('items/', views.items_list, name='items-list'),
    path('items/<int:item_id>/', views.item_detail, name='item-detail'),
]
```

### api/data.json

```json
[]
```

---

## 🧪 Тестирование API

### GET — Получить все записи

```bash
curl http://127.0.0.1:8000/api/items/
```

**Ответ:**
```json
{
  "items": [],
  "count": 0
}
```

### POST — Создать запись

```bash
curl -X POST http://127.0.0.1:8000/api/items/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Первая задача", "description": "Описание задачи"}'
```

**Ответ (201 Created):**
```json
{
  "id": 1,
  "name": "Первая задача",
  "description": "Описание задачи"
}
```

### POST — Создать ещё одну запись

```bash
curl -X POST http://127.0.0.1:8000/api/items/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Вторая задача", "description": "Ещё одно описание"}'
```

### GET — Получить все записи (после создания)

```bash
curl http://127.0.0.1:8000/api/items/
```

**Ответ:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Первая задача",
      "description": "Описание задачи"
    },
    {
      "id": 2,
      "name": "Вторая задача",
      "description": "Ещё одно описание"
    }
  ],
  "count": 2
}
```

### GET — Получить одну запись

```bash
curl http://127.0.0.1:8000/api/items/1/
```

**Ответ:**
```json
{
  "id": 1,
  "name": "Первая задача",
  "description": "Описание задачи"
}
```

### PUT — Обновить запись

```bash
curl -X PUT http://127.0.0.1:8000/api/items/1/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Обновлённая задача", "description": "Новое описание"}'
```

**Ответ:**
```json
{
  "id": 1,
  "name": "Обновлённая задача",
  "description": "Новое описание"
}
```

### PUT — Попытка обновить несуществующую запись

```bash
curl -X PUT http://127.0.0.1:8000/api/items/999/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Тест"}'
```

**Ответ (404 Not Found):**
```json
{
  "error": "Запись не найдена"
}
```

---

## 📊 Схема API

| Метод | URL | Описание | Статус |
|-------|-----|----------|--------|
| GET | `/api/items/` | Получить все записи | 200 |
| POST | `/api/items/` | Создать запись | 201 |
| GET | `/api/items/<id>/` | Получить одну запись | 200 |
| PUT | `/api/items/<id>/` | Обновить запись | 200 |

---

## 🔑 Ключевые моменты

1. **`@csrf_exempt`** — отключает проверку CSRF для API (в продакшене используйте токены)
2. **`@require_http_methods`** — ограничивает допустимые HTTP методы
3. **`request.body`** — сырое тело запроса, парсим JSON вручную
4. **JSON-файл** — простое хранилище без БД (для продакшена используйте PostgreSQL/SQLite)
5. **`JsonResponse`** — автоматически устанавливает `Content-Type: application/json`

---

## ⚠️ Ошибки и их обработка

| Код | Описание |
|-----|----------|
| 400 | Невалидный JSON или отсутствует обязательное поле |
| 404 | Запись с указанным ID не найдена |
| 405 | Метод не разрешён для данного URL |

---

## 📚 Полезные ссылки

- [Django документация](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [HTTP методы](https://developer.mozilla.org/ru/docs/Web/HTTP/Methods)
