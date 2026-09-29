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
