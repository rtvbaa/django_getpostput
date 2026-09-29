import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <h1>🐍 Django REST API</h1>
      <p>Простой проект с GET, POST, PUT запросами. Данные хранятся в JSON-файле.</p>
      <hr style={{ margin: '20px 0' }} />
      <h2>📁 Файлы проекта</h2>
      <p>Весь код Django находится в папке <code>django-project/</code></p>
      <ul>
        <li><strong>README.md</strong> — полная документация</li>
        <li><strong>api/views.py</strong> — обработчики GET/POST/PUT</li>
        <li><strong>api/data.json</strong> — хранилище данных</li>
      </ul>
      <h2>🚀 Запуск</h2>
      <pre style={{ background: '#f4f4f4', padding: '12px', borderRadius: '6px' }}>
        <code>{`pip install django
cd django-project
python manage.py runserver`}</code>
      </pre>
      <h2>📡 API Endpoints</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Метод</th>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>URL</th>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Описание</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>GET</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>/api/items/</code></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>Все записи</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>POST</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>/api/items/</code></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>Создать запись</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>GET</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>/api/items/&lt;id&gt;/</code></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>Одна запись</td>
          </tr>
          <tr>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>PUT</td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}><code>/api/items/&lt;id&gt;/</code></td>
            <td style={{ padding: '8px', border: '1px solid #ddd' }}>Обновить запись</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
