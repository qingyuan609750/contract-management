import pytest
import json
import os
import allure
from pageO.user_service import UserService

# 读取 DDT 数据文件
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_data')
with open(os.path.join(DATA_DIR, 'user_data.json'), 'r', encoding='utf-8') as f:
    USER_DATA = json.load(f)

ADD_USER_DATA = USER_DATA['add_user_cases']
UPDATE_USER_DATA = USER_DATA['update_user_cases']
DELETE_USER_DATA = USER_DATA['delete_user_cases']


@allure.feature('用户管理')
@allure.story('新增用户')
class TestAddUser:
    """新增用户测试用例"""

    @pytest.fixture
    def user_service(self, driver):
        """初始化 UserService"""
        service = UserService(driver)
        driver.get("http://127.0.0.1:8088/login")
        service.login()
        return service

    @allure.step("新增用户测试: {scenario}")
    @pytest.mark.parametrize("test_case", ADD_USER_DATA, ids=lambda x: x['scenario'])
    def test_add_user(self, user_service, test_case):
        """新增用户 - DDT驱动"""
        # 1. 调操作层
        success_msg = user_service.add_user(test_case)

        # 2. 断言
        assert test_case['expected'] in success_msg, \
            f"{test_case['scenario']}: 期望包含'{test_case['expected']}', 实际'{success_msg}'"


@allure.feature('用户管理')
@allure.story('修改用户')
class TestUpdateUser:
    """修改用户测试用例"""

    @pytest.fixture
    def user_service(self, driver):
        """初始化 UserService"""
        service = UserService(driver)
        driver.get("http://127.0.0.1:8088/login")
        service.login()
        return service

    @allure.step("修改用户测试: {scenario}")
    @pytest.mark.parametrize("test_case", UPDATE_USER_DATA, ids=lambda x: x['scenario'])
    def test_update_user(self, user_service, test_case):
        """修改用户 - DDT驱动"""
        # 1. 调操作层
        success_msg = user_service.edit_first_user(
            test_case['newUserName'],
            test_case['newEmail'],
            test_case['newPhone']
        )

        # 2. 断言
        assert test_case['expected'] in success_msg, \
            f"{test_case['scenario']}: 期望包含'{test_case['expected']}', 实际'{success_msg}'"


@allure.feature('用户管理')
@allure.story('删除用户')
class TestDeleteUser:
    """删除用户测试用例"""

    @pytest.fixture
    def user_service(self, driver):
        """初始化 UserService"""
        service = UserService(driver)
        driver.get("http://127.0.0.1:8088/login")
        service.login()
        return service

    @allure.step("删除用户测试: {scenario}")
    @pytest.mark.parametrize("test_case", DELETE_USER_DATA, ids=lambda x: x['scenario'])
    def test_delete_user(self, user_service, test_case):
        """删除用户 - DDT驱动"""
        # 1. 调操作层
        success_msg = user_service.delete_first_user(test_case['confirm'])

        # 2. 断言
        assert test_case['expected'] in success_msg, \
            f"{test_case['scenario']}: 期望包含'{test_case['expected']}', 实际'{success_msg}'"


@allure.feature('用户管理')
@allure.story('Faker数据驱动测试')
class TestUserWithFaker:
    """使用 Faker 生成数据的测试"""

    @pytest.fixture
    def user_service(self, driver):
        """初始化 UserService"""
        service = UserService(driver)
        driver.get("http://127.0.0.1:8088/login")
        service.login()
        return service

    @allure.step("使用 Faker 生成用户数据并新增")
    def test_add_user_with_faker(self, user_service):
        """测试使用 Faker 数据新增用户"""
        # 1. 生成 Faker 数据
        test_data = user_service.generate_user_data(count=1)
        user = test_data[0]

        # 2. 调操作层执行新增
        success_msg = user_service.add_user(user)

        # 3. 断言结果
        assert "操作成功" in success_msg or "成功" in success_msg, \
            f"新增用户失败: {success_msg}"

    @allure.step("批量新增多个用户")
    @pytest.mark.parametrize("count", [3])
    def test_add_multiple_users(self, user_service, count):
        """测试批量新增用户"""
        test_data = user_service.generate_user_data(count=count)

        for user in test_data:
            success_msg = user_service.add_user(user)
            assert "操作成功" in success_msg or "成功" in success_msg, \
                f"新增用户 {user['loginName']} 失败: {success_msg}"