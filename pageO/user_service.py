import json
import os
from faker import Faker
from pageO.login_page import LoginPage
from pageO.user_page import UserPage

FAKER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'faker_data')
os.makedirs(FAKER_DIR, exist_ok=True)


class UserService:
    """
    用户管理操作层
    结合 Faker 生成测试数据，调用 Page 完成 UI 操作
    """

    def __init__(self, driver):
        self.driver = driver
        self.login_page = LoginPage(driver)
        self.user_page = UserPage(driver)
        self.fake = Faker('zh_CN')

    def login(self, username: str = "admin", password: str = "admin123"):
        """登录系统"""
        self.login_page.input_username(username)
        self.login_page.input_password(password)
        self.login_page.click_login_button()

    def generate_user_data(self, count: int = 1) -> list:
        """使用 Faker 生成用户测试数据"""
        test_data = []
        timestamp = int(__import__('time').time())

        for i in range(count):
            user = {
                'loginName': f'test_user_{timestamp}_{i}',
                'userName': self.fake.name(),
                'email': self.fake.email(),
                'phonenumber': self.fake.phone_number(),
                'password': '123456'
            }
            test_data.append(user)

        # 保存到 JSON 文件
        output_path = os.path.join(FAKER_DIR, 'ui_test_users.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, ensure_ascii=False, indent=2)
        print(f'UI 测试数据已保存到 {output_path}，共 {len(test_data)} 条')

        return test_data

    def add_user(self, user_data: dict) -> str:
        """
        新增用户（完整业务流程）
        :param user_data: 用户数据字典
        :return: 成功提示信息
        """
        # 1. 导航到用户管理页面
        self.user_page.navigate_to_user_page()

        # 2. 点击新增
        self.user_page.click_add_user()

        # 3. 填写表单
        self.user_page.fill_user_form(
            login_name=user_data['loginName'],
            user_name=user_data['userName'],
            email=user_data['email'],
            phone=user_data['phonenumber'],
            password=user_data['password']
        )

        # 4. 提交
        self.user_page.submit_form()

        # 5. 返回成功提示
        return self.user_page.get_success_message()

    def edit_first_user(self, new_user_name: str, new_email: str, new_phone: str) -> str:
        """
        修改第一个用户
        :param new_user_name: 新用户名
        :param new_email: 新邮箱
        :param new_phone: 新手机号
        :return: 成功提示信息
        """
        # 1. 导航到用户管理页面
        self.user_page.navigate_to_user_page()

        # 2. 点击修改
        self.user_page.click_edit_first_user()

        # 3. 填写修改表单
        self.user_page.fill_edit_form(new_user_name, new_email, new_phone)

        # 4. 提交
        self.user_page.submit_edit_form()

        # 5. 返回成功提示
        return self.user_page.get_success_message()

    def delete_first_user(self, confirm: bool = True) -> str:
        """
        删除第一个用户
        :param confirm: 是否确认删除
        :return: 成功提示信息或取消提示
        """
        # 1. 导航到用户管理页面
        self.user_page.navigate_to_user_page()

        # 2. 点击删除
        self.user_page.click_delete_first_user()

        # 3. 确认或取消
        if confirm:
            self.user_page.confirm_delete()
        else:
            self.user_page.cancel_delete()

        # 4. 返回提示信息
        return self.user_page.get_success_message()

    def search_and_verify_user(self, keyword: str) -> bool:
        """
        搜索用户并验证是否存在
        :param keyword: 搜索关键词
        :return: 是否存在
        """
        self.user_page.navigate_to_user_page()
        self.user_page.search_user(keyword)
        return self.user_page.get_table_rows_count() > 0