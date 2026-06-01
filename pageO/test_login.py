import pytest
import json
import os
import allure
from pageO.login_service import LoginService

# 读取 DDT 数据文件
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'test_data')
with open(os.path.join(DATA_DIR, 'login_data.json'), 'r', encoding='utf-8') as f:
    LOGIN_DATA = json.load(f)['login_cases']


@allure.feature('登录管理')
@allure.story('用户登录')
class TestLogin:
    """
    登录业务层测试用例
    使用 DDT 从 JSON 文件读取测试数据
    """

    @pytest.fixture
    def login_service(self, driver):
        """初始化 LoginService"""
        service = LoginService(driver)
        driver.get("http://127.0.0.1:8088/login")
        return service

    @pytest.mark.parametrize("test_case", LOGIN_DATA, ids=lambda x: x['scenario'])
    def test_login(self, login_service, test_case):
        """登录测试 - DDT驱动"""
        allure.dynamic.title(f"登录测试: {test_case['scenario']}")
        # 1. 调操作层
        login_service.login(test_case['username'], test_case['password'])

        # 2. 取结果
        page_source = login_service.login_page.driver.page_source

        # 3. 断言
        assert test_case['expected'] in page_source, \
            f"{test_case['description']}: 期望包含'{test_case['expected']}', 实际未找到"