# Простой Django проект с GET, POST, PUT запросами

## 📋 Описание

Это минимальный Django REST API проект, который демонстрирует работу с тремя HTTP методами:
- **GET** — получение данных
- **POST** — создание новых данных
- **PUT** — обновление существующих данных

Данные хранятся в JSON-файле (без базы данных для максимальной простоты).

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
pip install django djangorestframework
```

### 2. Создание проекта

```bash
django-admin startproject myproject
cd myproject
python manage.py startapp api
```

### 3. Структура проекта

```
myproject/
├── manage.py
├── myproject/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── api/
    ├── __init__.py
    ├── views.py
    ├── urls.py
    └── data.json
```

---

## 📝 Код проекта

### settings.py (добавить приложения)

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'api',
]
```

### api/data.json (файл для хранения данных)

```json
[]
```

### api/views.py

```python
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


# Путь к файлу с данными
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
        return JsonResponse({'items': data, 'count': len(data)}, safe=False)

    elif request.method == 'POST':
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Невалидный JSON'}, status=400)

        # Валидация
        if 'name' not in body:
            return JsonResponse({'error': 'Поле "name" обязательно'}, status=400)

        data = read_data()

        # Генерируем ID
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

        # Обновляем поля
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

### myproject/urls.py

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

---

## 🧪 Тестирование API

### Запустить сервер

```bash
python manage.py runserver
```

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
