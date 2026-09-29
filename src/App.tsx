import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const markdownContent = `# Простой Django проект с GET, POST, PUT запросами

## 📋 Описание

Это минимальный Django REST API проект, который демонстрирует работу с тремя HTTP методами:
- **GET** — получение данных
- **POST** — создание новых данных
- **PUT** — обновление существующих данных

Данные хранятся в JSON-файле (без базы данных для максимальной простоты).

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

\`\`\`bash
pip install django djangorestframework
\`\`\`

### 2. Создание проекта

\`\`\`bash
django-admin startproject myproject
cd myproject
python manage.py startapp api
\`\`\`

### 3. Структура проекта

\`\`\`
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
\`\`\`

---

## 📝 Код проекта

### settings.py (добавить приложения)

\`\`\`python
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
\`\`\`

### api/data.json (файл для хранения данных)

\`\`\`json
[]
\`\`\`

### api/views.py

\`\`\`python
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
\`\`\`

### api/urls.py

\`\`\`python
from django.urls import path
from . import views

urlpatterns = [
    path('items/', views.items_list, name='items-list'),
    path('items/<int:item_id>/', views.item_detail, name='item-detail'),
]
\`\`\`

### myproject/urls.py

\`\`\`python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
\`\`\`

---

## 🧪 Тестирование API

### Запустить сервер

\`\`\`bash
python manage.py runserver
\`\`\`

### GET — Получить все записи

\`\`\`bash
curl http://127.0.0.1:8000/api/items/
\`\`\`

**Ответ:**
\`\`\`json
{
  "items": [],
  "count": 0
}
\`\`\`

### POST — Создать запись

\`\`\`bash
curl -X POST http://127.0.0.1:8000/api/items/ \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Первая задача", "description": "Описание задачи"}'
\`\`\`

**Ответ (201 Created):**
\`\`\`json
{
  "id": 1,
  "name": "Первая задача",
  "description": "Описание задачи"
}
\`\`\`

### POST — Создать ещё одну запись

\`\`\`bash
curl -X POST http://127.0.0.1:8000/api/items/ \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Вторая задача", "description": "Ещё одно описание"}'
\`\`\`

### GET — Получить все записи (после создания)

\`\`\`bash
curl http://127.0.0.1:8000/api/items/
\`\`\`

**Ответ:**
\`\`\`json
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
\`\`\`

### GET — Получить одну запись

\`\`\`bash
curl http://127.0.0.1:8000/api/items/1/
\`\`\`

**Ответ:**
\`\`\`json
{
  "id": 1,
  "name": "Первая задача",
  "description": "Описание задачи"
}
\`\`\`

### PUT — Обновить запись

\`\`\`bash
curl -X PUT http://127.0.0.1:8000/api/items/1/ \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Обновлённая задача", "description": "Новое описание"}'
\`\`\`

**Ответ:**
\`\`\`json
{
  "id": 1,
  "name": "Обновлённая задача",
  "description": "Новое описание"
}
\`\`\`

### PUT — Попытка обновить несуществующую запись

\`\`\`bash
curl -X PUT http://127.0.0.1:8000/api/items/999/ \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Тест"}'
\`\`\`

**Ответ (404 Not Found):**
\`\`\`json
{
  "error": "Запись не найдена"
}
\`\`\`

---

## 📊 Схема API

| Метод | URL | Описание | Статус |
|-------|-----|----------|--------|
| GET | \`/api/items/\` | Получить все записи | 200 |
| POST | \`/api/items/\` | Создать запись | 201 |
| GET | \`/api/items/<id>/\` | Получить одну запись | 200 |
| PUT | \`/api/items/<id>/\` | Обновить запись | 200 |

---

## 🔑 Ключевые моменты

1. **\`@csrf_exempt\`** — отключает проверку CSRF для API (в продакшене используйте токены)
2. **\`@require_http_methods\`** — ограничивает допустимые HTTP методы
3. **\`request.body\`** — сырое тело запроса, парсим JSON вручную
4. **JSON-файл** — простое хранилище без БД (для продакшена используйте PostgreSQL/SQLite)
5. **\`JsonResponse\`** — автоматически устанавливает \`Content-Type: application/json\`

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
`

interface Section {
  id: string
  title: string
  level: number
}

function App() {
  const [activeSection, setActiveSection] = useState<string>('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('h1, h2, h3')
      let current = ''
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 120) {
          current = section.id || ''
        }
      })
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sections: Section[] = [
    { id: 'описание', title: '📋 Описание', level: 2 },
    { id: 'быстрый-старт', title: '🚀 Быстрый старт', level: 2 },
    { id: 'код-проекта', title: '📝 Код проекта', level: 2 },
    { id: 'тестирование-api', title: '🧪 Тестирование API', level: 2 },
    { id: 'схема-api', title: '📊 Схема API', level: 2 },
    { id: 'ключевые-моменты', title: '🔑 Ключевые моменты', level: 2 },
    { id: 'ошибки-и-их-обработка', title: '⚠️ Ошибки', level: 2 },
    { id: 'полезные-ссылки', title: '📚 Ссылки', level: 2 },
  ]

  const copyToClipboard = (code: string, index: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(index)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
              🐍
            </div>
            <div>
              <h1 className="text-xl font-bold">Django REST API</h1>
              <p className="text-green-200 text-sm">GET • POST • PUT</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-medium">
              v1.0
            </span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-200 rounded-full text-xs font-medium">
              Простой проект
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block w-64 min-h-screen sticky top-16 p-4 border-r border-gray-200 bg-white">
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              Навигация
            </p>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activeSection === section.id
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <p className="text-xs font-semibold text-green-800 mb-2">💡 Совет</p>
            <p className="text-xs text-green-700">
              Документация также доступна в файле{' '}
              <code className="bg-green-100 px-1 rounded">django-docs.md</code>
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 mb-8 text-white shadow-xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Простой Django проект
              </h1>
              <p className="text-green-100 text-lg mb-6">
                Минимальный REST API с GET, POST, PUT запросами.
                Данные хранятся в JSON-файле — без базы данных.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-4 py-2">
                  <span className="text-green-300 font-mono font-bold text-sm">GET</span>
                  <span className="text-sm">Получить данные</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-4 py-2">
                  <span className="text-yellow-300 font-mono font-bold text-sm">POST</span>
                  <span className="text-sm">Создать запись</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-lg px-4 py-2">
                  <span className="text-blue-300 font-mono font-bold text-sm">PUT</span>
                  <span className="text-sm">Обновить запись</span>
                </div>
              </div>
            </div>

            {/* API Endpoints Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📡</span> API Эндпоинты
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <EndpointCard method="GET" url="/api/items/" description="Все записи" color="green" />
                <EndpointCard method="POST" url="/api/items/" description="Создать запись" color="yellow" />
                <EndpointCard method="GET" url="/api/items/&lt;id&gt;/" description="Одна запись" color="green" />
                <EndpointCard method="PUT" url="/api/items/&lt;id&gt;/" description="Обновить запись" color="blue" />
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-lg max-w-none
              prose-headings:text-gray-800 prose-headings:font-bold
              prose-h1:text-3xl prose-h1:border-b prose-h1:border-gray-200 prose-h1:pb-3
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:text-gray-700
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-800
              prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg
              prose-table:border-collapse prose-table:w-full
              prose-th:bg-gray-100 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-sm prose-th:font-semibold
              prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-gray-200
              prose-li:text-gray-600
              prose-blockquote:border-green-500 prose-blockquote:bg-green-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            ">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match && !className
                    if (isInline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre({ children, ...props }) {
                    const codeElement = children as React.ReactElement
                    const codeString = codeElement?.props?.children?.toString() || ''
                    const codeIndex = Math.random().toString(36)
                    
                    return (
                      <div className="relative group my-4">
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={() => copyToClipboard(codeString, codeIndex)}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-xs transition-colors opacity-0 group-hover:opacity-100"
                          >
                            {copiedCode === codeIndex ? '✓ Скопировано' : '📋 Копировать'}
                          </button>
                        </div>
                        <pre {...props}>{children}</pre>
                      </div>
                    )
                  },
                  h2({ children, ...props }) {
                    const text = children?.toString() || ''
                    const id = text.toLowerCase()
                      .replace(/[^\wа-яё\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-')
                    return (
                      <h2 id={id} className="scroll-mt-20" {...props}>
                        {children}
                      </h2>
                    )
                  },
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-200 pt-8 pb-12 text-center text-gray-500 text-sm">
              <p>📄 Документация сохранена в файле <code className="bg-gray-100 px-2 py-0.5 rounded">django-docs.md</code></p>
              <p className="mt-2">Django REST API • Простой проект с подробной документацией</p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

function EndpointCard({ method, url, description, color }: { method: string; url: string; description: string; color: string }) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  }
  const c = colorClasses[color] || colorClasses.green

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${c.border} ${c.bg}`}>
      <span className={`font-mono font-bold text-xs px-2 py-1 rounded ${c.text} bg-white`}>
        {method}
      </span>
      <div className="min-w-0">
        <code className="text-sm text-gray-700 block truncate">{url}</code>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
    </div>
  )
}

export default App
