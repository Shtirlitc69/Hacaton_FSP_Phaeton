import urllib.request
import json

def run_tests():
    print("=== 1. TEST CAT ADAPTIVE FLOW ===")
    start_data = json.dumps({'specialization_slug': 'backend', 'claimed_grade_slug': 'middle'}).encode()
    req = urllib.request.Request('http://localhost:8000/api/v1/assessment/start', data=start_data, headers={'Content-Type': 'application/json'})
    start_res = json.loads(urllib.request.urlopen(req).read().decode())
    session_id = start_res['session_id']
    print(f"Session started: id={session_id}, spec={start_res['specialization_name']}, grade={start_res['claimed_grade_name']}")

    # Получаем вопрос 1
    q1 = json.loads(urllib.request.urlopen(f'http://localhost:8000/api/v1/assessment/{session_id}/next').read().decode())
    print(f"Вопрос #1: id={q1['template_id']}, код={q1['template_code']}, вариантов={len(q1['options'])}")
    assert len(q1['options']) == 4

    # Отправляем ответ на вопрос 1
    ans_data = json.dumps({
        'session_id': session_id,
        'template_id': q1['template_id'],
        'selected_option_index': 0,
        'time_spent_seconds': 5.0,
        'tab_switch_count': 0
    }).encode()
    ans_req = urllib.request.Request(f'http://localhost:8000/api/v1/assessment/{session_id}/answer', data=ans_data, headers={'Content-Type': 'application/json'})
    ans1 = json.loads(urllib.request.urlopen(ans_req).read().decode())
    print(f"Ответ #1 обработан: is_correct={ans1['is_correct']}, текущая theta={ans1['current_theta']}, SE={ans1['current_se']}")

    # Получаем вопрос 2
    q2 = json.loads(urllib.request.urlopen(f'http://localhost:8000/api/v1/assessment/{session_id}/next').read().decode())
    print(f"Вопрос #2: id={q2['template_id']}, код={q2['template_code']}, вопрос={q2['question_text'][:50]}...")
    assert q2['question_index'] == 2, f"Индекс вопроса должен быть 2, а получен {q2['question_index']}"
    assert q2['template_id'] != q1['template_id'], "Вопрос #2 не должен повторять вопрос #1!"

    # Завершаем тест
    fin_req = urllib.request.Request(f'http://localhost:8000/api/v1/assessment/{session_id}/finish', data=b'', headers={'Content-Type': 'application/json'})
    fin_res = json.loads(urllib.request.urlopen(fin_req).read().decode())
    print(f"Тест успешно завершен: грейд={fin_res['assigned_grade_name']}, final_theta={fin_res['final_theta']}, перцентиль={fin_res['percentile']}")
    assert fin_res['assigned_grade_name'] is not None

    print("\n=== 2. TEST EMPLOYER MATCHING & REVERSE RECRUITING ===")
    def get_recs(grade, s_from, s_to):
        payload = {
            'title': 'Разработчик',
            'specialization_slug': 'backend',
            'target_grade_slug': grade,
            'salary_from': s_from,
            'salary_to': s_to,
            'required_skills': ['Python', 'FastAPI'],
            'description': 'Команда платформы'
        }
        r = urllib.request.Request('http://localhost:8000/api/v1/matching/recommendations', data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
        return json.loads(urllib.request.urlopen(r).read().decode())

    recs_middle = get_recs('middle', 180000, 240000)
    recs_senior = get_recs('senior', 300000, 420000)

    print(f"Подбор Middle (вилка 180-240к): Топ-1 = {recs_middle[0]['pseudonym']} (совпадение {int(recs_middle[0]['match_score']*100)}%, перцентиль {recs_middle[0]['percentile']}%)")
    print(f"Подбор Senior (вилка 300-420к): Топ-1 = {recs_senior[0]['pseudonym']} (совпадение {int(recs_senior[0]['match_score']*100)}%, перцентиль {recs_senior[0]['percentile']}%)")

    assert recs_middle[0]['pseudonym'] != recs_senior[0]['pseudonym'], "Ранжирование должно адаптироваться под грейд и зарплату!"
    assert recs_senior[0]['match_score'] != recs_middle[0]['match_score'], "Оценки совпадения должны пересчитываться!"

    print("\n ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ! Все 3 дефекта устранены на 100%.")

if __name__ == '__main__':
    run_tests()
