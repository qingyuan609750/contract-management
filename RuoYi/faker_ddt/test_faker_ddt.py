import pytest
import json
import os
import allure
import requests
from faker import Faker

BASE_URL = 'http://localhost:8088'
FAKER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'faker_data')

# 确保数据目录存在
os.makedirs(FAKER_DIR, exist_ok=True)


def generate_ruoyi_user_test_data(count: int = 10) -> list:
    """第1步：用Faker生成若依用户管理的新增测试数据"""
    fake = Faker('zh_CN')
    test_data = []
    timestamp = int(__import__('time').time())

    for i in range(count):
        normal_case = {
            'loginName': f'test_user_{timestamp}_{i}',
            'userName': fake.name(),
            'password': '123456',
            'deptId': 103,
            'email': fake.email(),
            'phonenumber': fake.phone_number(),
            'expected_code': 0,
            'expected_message': '操作成功',
            'test_scenario': 'normal'
        }
        test_data.append(normal_case)

    # 异常场景 - 账号已存在
    duplicate_case = {
        'loginName': 'admin',
        'userName': '重复账号',
        'password': '123456',
        'deptId': 103,
        'email': 'duplicate@test.com',
        'phonenumber': '13800138000',
        'expected_code': 500,
        'expected_message': '已存在',
        'test_scenario': 'duplicate'
    }
    test_data.append(duplicate_case)

    # 保存到 JSON 文件
    output_path = os.path.join(FAKER_DIR, 'temp_users.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(test_data, f, ensure_ascii=False, indent=2)
    print(f'测试数据已保存到 {output_path}，共 {len(test_data)} 条')

    return test_data


@pytest.fixture(scope='session')
def login_session():
    """登录若依系统，返回已认证的 requests.Session"""
    s = requests.Session()
    r = s.post(f'{BASE_URL}/login', data={
        'username': 'admin',
        'password': '123456',
        'rememberMe': 'true'
    }, timeout=10)
    assert r.json().get('code') == 0, f"登录失败: {r.json()}"
    return s


# ========== 第2步：新增用户 ==========
TEST_DATA = generate_ruoyi_user_test_data(10)
ADDED_USER_IDS = []


@allure.feature('用户管理')
@allure.story('新增用户')
@pytest.mark.parametrize('user', TEST_DATA)
def test_add_user(login_session, user):
    """新增用户用例"""
    s = login_session

    add_data = {
        'loginName': user['loginName'],
        'userName': user['userName'],
        'password': user['password'],
        'deptId': user['deptId'],
        'email': user['email'],
        'phonenumber': user['phonenumber'],
        'status': '0',
        'roleIds': '2',
        'postIds': '1'
    }

    with allure.step(f"新增用户: {user['loginName']}"):
        r = s.post(f'{BASE_URL}/system/user/add', data=add_data, timeout=10)
        result = r.json()

    with allure.step("断言响应结果"):
        if user['test_scenario'] == 'normal':
            assert result.get('code') == user['expected_code'], \
                f"新增用户 {user['loginName']} 失败: {result}"
            assert result.get('msg') == user['expected_message'], \
                f"消息不匹配: 期望'{user['expected_message']}', 实际'{result.get('msg')}'"

            # 查询获取userId
            r2 = s.post(f'{BASE_URL}/system/user/list', data={'loginName': user['loginName']}, timeout=10)
            users = r2.json().get('rows', [])
            if users:
                ADDED_USER_IDS.append({
                    'userId': users[0]['userId'],
                    'loginName': user['loginName'],
                    'userName': user['userName']
                })

        elif user['test_scenario'] == 'duplicate':
            assert result.get('code') == user['expected_code'], \
                f"重复账号应返回500: {result}"
            assert '已存在' in result.get('msg', ''), \
                f"消息应包含'已存在': {result.get('msg')}"


# ========== 第3步：查询用户 ==========
@allure.feature('用户管理')
@allure.story('查询用户')
def test_query_user_by_name(login_session):
    """查询用户用例 - 遍历所有新增成功的用户"""
    s = login_session

    for user in ADDED_USER_IDS:
        with allure.step(f"查询用户: {user['loginName']}"):
            r = s.post(f'{BASE_URL}/system/user/list', data={'loginName': user['loginName']}, timeout=10)
            result = r.json()

        with allure.step("断言查询结果"):
            assert result.get('code') == 0, f"查询失败: {result}"
            rows = result.get('rows', [])
            assert len(rows) > 0, f"未查询到用户 {user['loginName']}"
            assert rows[0]['loginName'] == user['loginName'], \
                f"loginName不匹配: 期望'{user['loginName']}', 实际'{rows[0]['loginName']}'"


# ========== 第4步：修改用户 ==========
@allure.feature('用户管理')
@allure.story('修改用户')
def test_update_user(login_session):
    """修改用户用例"""
    s = login_session
    fake = Faker('zh_CN')

    for user in ADDED_USER_IDS:
        new_userName = fake.name() + '_修改'

        with allure.step(f"修改用户: {user['loginName']}, 新用户名: {new_userName}"):
            edit_data = {
                'userId': user['userId'],
                'loginName': user['loginName'],
                'userName': new_userName,
                'deptId': 103,
                'email': fake.email(),
                'phonenumber': fake.phone_number(),
                'status': '0',
                'roleIds': '2',
                'postIds': '1'
            }
            r = s.post(f'{BASE_URL}/system/user/edit', data=edit_data, timeout=10)
            result = r.json()

        with allure.step("断言修改结果"):
            assert result.get('code') == 0, f"修改失败: {result}"

        with allure.step("查询验证修改生效"):
            r2 = s.post(f'{BASE_URL}/system/user/list', data={'loginName': user['loginName']}, timeout=10)
            rows = r2.json().get('rows', [])
            assert len(rows) > 0, f"查询不到用户 {user['loginName']}"
            assert rows[0]['userName'] == new_userName, \
                f"userName未更新: 期望'{new_userName}', 实际'{rows[0]['userName']}'"


# ========== 第5步：删除用户 ==========
@allure.feature('用户管理')
@allure.story('删除用户')
def test_delete_user(login_session):
    """删除用户用例"""
    s = login_session

    for user in ADDED_USER_IDS:
        with allure.step(f"删除用户: {user['loginName']} (userId={user['userId']})"):
            r = s.post(f'{BASE_URL}/system/user/remove', data={'ids': user['userId']}, timeout=10)
            result = r.json()

        with allure.step("断言删除结果"):
            assert result.get('code') == 0, f"删除失败: {result}"

        with allure.step("查询验证用户已删除"):
            r2 = s.post(f'{BASE_URL}/system/user/list', data={'loginName': user['loginName']}, timeout=10)
            rows = r2.json().get('rows', [])
            assert len(rows) == 0, f"用户 {user['loginName']} 仍存在，删除未生效"


# 保存新增成功的用户ID到文件
def pytest_sessionfinish(session, exitstatus):
    if ADDED_USER_IDS:
        output_path = os.path.join(FAKER_DIR, 'added_users.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(ADDED_USER_IDS, f, ensure_ascii=False, indent=2)
