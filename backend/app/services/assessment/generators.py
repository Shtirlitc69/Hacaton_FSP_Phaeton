"""
================================================================================
ФСП ХАКАТОН 2026: ПАРАМЕТРИЗОВАННЫЕ ГЕНЕРАТОРЫ ЗАДАНИЙ (Anti-Leak Engine)
================================================================================
Зона ответственности: Testing Lead / Content Engineer

Назначение (Ключевое требование раздела 2 ТЗ):
- Проблема: Статические тесты мгновенно сливаются в Telegram/GitHub;
  чистая генерация через LLM "на лету" дает нестабильную сложность и галлюцинации.
- Решение: Калиброванные параметризованные шаблоны заданий с ДЕТЕРМИНИРОВАННОЙ автопроверкой.
- При каждой сессии генерируются уникальные числа N, K, имена переменных и фрагменты кода.
- Правильный ответ и дистракторы (неверные варианты) рассчитываются программным чекером.
- Заучивание ответов полностью бесполезно: у разных кандидатов разные входные данные!
================================================================================
"""

import random
from typing import Dict, Any, List, Tuple


class ParameterizedQuestionGenerator:
    """Движок генерации конкретных инстансов вопросов из параметрических шаблонов"""

    @staticmethod
    def generate_algorithmic_complexity(template_code: str) -> Dict[str, Any]:
        """Генерация задачи на оценку временной сложности с рандомизированными циклами N и K"""
        n_power = random.choice([1, 2, 3])
        has_log = random.choice([True, False])
        k_factor = random.randint(2, 8)
        
        if n_power == 1 and not has_log:
            complexity = "O(N)"
            wrong_1 = "O(N log N)"
            wrong_2 = "O(N²)"
            wrong_3 = "O(log N)"
            code_snippet = f"""def process_data(data, k={k_factor}):
    total = 0
    for i in range(len(data)):
        if i % k == 0:
            total += data[i]
    return total"""
        elif n_power == 1 and has_log:
            complexity = "O(N log N)"
            wrong_1 = "O(N²)"
            wrong_2 = "O(N)"
            wrong_3 = "O(log N)"
            code_snippet = f"""def process_data(data, k={k_factor}):
    import heapq
    heap = []
    for x in data:
        heapq.heappush(heap, x * {k_factor})
    return [heapq.heappop(heap) for _ in range(len(data))]"""
        else:
            complexity = "O(N²)"
            wrong_1 = "O(N log N)"
            wrong_2 = "O(N³)"
            wrong_3 = "O(N)"
            code_snippet = f"""def process_data(matrix, k={k_factor}):
    count = 0
    n = len(matrix)
    for i in range(n):
        for j in range(i, n):
            if (matrix[i] + matrix[j]) % {k_factor} == 0:
                count += 1
    return count"""

        options = [complexity, wrong_1, wrong_2, wrong_3]
        random.shuffle(options)
        correct_index = options.index(complexity)

        return {
            "question_text": f"Определите асимптотическую временную сложность (Time Complexity) следующей функции:",
            "code": code_snippet,
            "options": options,
            "correct_option_index": correct_index,
            "correct_answer": complexity,
            "explanation": f"Внешний и внутренний обход дают точную сложность {complexity}.",
            "params": {"n_power": n_power, "has_log": has_log, "k_factor": k_factor}
        }

    @staticmethod
    def generate_python_scope_and_closures(template_code: str) -> Dict[str, Any]:
        """Генерация задачи на замыкания и Late Binding в Python"""
        multiplier = random.randint(2, 5)
        index_target = random.randint(0, 3)
        
        # Знаменитый трюк с замыканием в цикле: i связывается на момент вызова, а не создания
        correct_val = 3 * multiplier
        wrong_val_1 = index_target * multiplier
        wrong_val_2 = 0
        wrong_val_3 = (index_target + 1) * multiplier

        code_snippet = f"""def make_multipliers():
    funcs = []
    for i in range(4):
        funcs.append(lambda x: x + i * {multiplier})
    return funcs

multipliers = make_multipliers()
result = multipliers[{index_target}](0)
print(result)"""

        options = [str(correct_val), str(wrong_val_1), str(wrong_val_2), str(wrong_val_3)]
        options = list(dict.fromkeys(options))  # Удаление дубликатов если совпадут
        while len(options) < 4:
            options.append(str(random.randint(20, 50)))
        random.shuffle(options)
        correct_index = options.index(str(correct_val))

        return {
            "question_text": "Что выведет данный фрагмент кода на Python?",
            "code": code_snippet,
            "options": options,
            "correct_option_index": correct_index,
            "correct_answer": str(correct_val),
            "explanation": f"Из-за late binding в замыканиях Python переменная i на момент вызова равна 3. 0 + 3 * {multiplier} = {correct_val}.",
            "params": {"multiplier": multiplier, "index_target": index_target}
        }

    @staticmethod
    def generate_sql_transaction_isolation(template_code: str) -> Dict[str, Any]:
        """Генерация задачи на уровни изоляции транзакций PostgreSQL (Read Committed vs Repeatable Read)"""
        iso_levels = [
            ("READ COMMITTED", "Видит закоммиченные изменения второй транзакции (Non-repeatable read возможен)", True),
            ("REPEATABLE READ", "Видит снимок данных на момент старта первой транзакции (Snapshot Isolation)", False)
        ]
        chosen_level, explanation, sees_commit = random.choice(iso_levels)
        init_balance = random.choice([1000, 2000, 5000])
        transfer_amount = random.choice([300, 500, 800])
        
        final_balance = init_balance + transfer_amount if sees_commit else init_balance

        code_snippet = f"""-- Транзакция 1 (Уровень {chosen_level}):
BEGIN TRANSACTION ISOLATION LEVEL {chosen_level};
SELECT balance FROM accounts WHERE id = 42; -- вернуло {init_balance}

-- Транзакция 2 (параллельно):
BEGIN;
UPDATE accounts SET balance = balance + {transfer_amount} WHERE id = 42;
COMMIT;

-- Транзакция 1 (продолжение):
SELECT balance FROM accounts WHERE id = 42; -- ЧТО ВЕРНЕТ ЭТОТ ЗАПРОС?"""

        correct_str = str(final_balance)
        wrong_str_1 = str(init_balance if sees_commit else init_balance + transfer_amount)
        wrong_str_2 = "Ошибка сериализации (Serialization Failure)"
        wrong_str_3 = "NULL"

        options = [correct_str, wrong_str_1, wrong_str_2, wrong_str_3]
        random.shuffle(options)
        correct_index = options.index(correct_str)

        return {
            "question_text": f"Работа с транзакциями в PostgreSQL. Определите результат повторного SELECT:",
            "code": code_snippet,
            "options": options,
            "correct_option_index": correct_index,
            "correct_answer": correct_str,
            "explanation": f"На уровне {chosen_level}: {explanation}.",
            "params": {"level": chosen_level, "init": init_balance, "transfer": transfer_amount}
        }

    @classmethod
    def instantiate_item(cls, item_code: str) -> Dict[str, Any]:
        """Диспетчер инстанцирования задания по коду шаблона"""
        if "ALG" in item_code or "COMPLEX" in item_code:
            return cls.generate_algorithmic_complexity(item_code)
        elif "SQL" in item_code or "DB" in item_code:
            return cls.generate_sql_transaction_isolation(item_code)
        else:
            return cls.generate_python_scope_and_closures(item_code)
