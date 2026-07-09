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

        with allure.step(f"步骤1: 执行登录操作 (用户名: {test_case['username']})"):
            login_service.login(test_case['username'], test_case['password'])
            allure.attach(
                f"用户名: {test_case['username']}\n密码: ********",
                name="登录凭证",
                attachment_type=allure.attachment_type.TEXT
            )

        with allure.step("步骤2: 获取页面结果"):
            page_source = login_service.login_page.driver.page_source
            allure.attach(page_source, name="页面源码", attachment_type=allure.attachment_type.HTML)

        with allure.step(f"步骤3: 断言页面包含预期文本: {test_case['expected']}"):
            result = test_case['expected'] in page_source
            allure.attach(
                f"预期包含: {test_case['expected']}\n实际结果: {'通过' if result else '未通过'}",
                name="断言详情",
                attachment_type=allure.attachment_type.TEXT
            )
            assert result, \
                f"{test_case['description']}: 期望包含'{test_case['expected']}', 实际未找到"