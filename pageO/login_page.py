from selenium.webdriver.common.by import By


class LoginPage:
    """
    若依登录页面对象库类
    只包含元素定位和基本操作
    """

    # 元素定位（集中管理，一处修改全局生效）
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "loginBtn")

    def __init__(self, driver):
        self.driver = driver

    def input_username(self, username: str):
        """输入用户名"""
        self.driver.find_element(*self.USERNAME_INPUT).send_keys(username)

    def input_password(self, password: str):
        """输入密码"""
        self.driver.find_element(*self.PASSWORD_INPUT).send_keys(password)

    def click_login_button(self):
        """点击登录按钮"""
        self.driver.find_element(*self.LOGIN_BUTTON).click()