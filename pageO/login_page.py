from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


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
        self.wait = WebDriverWait(driver, 10)

    def input_username(self, username: str):
        """输入用户名"""
        element = self.wait.until(EC.presence_of_element_located(self.USERNAME_INPUT))
        element.send_keys(username)

    def input_password(self, password: str):
        """输入密码"""
        element = self.wait.until(EC.presence_of_element_located(self.PASSWORD_INPUT))
        element.send_keys(password)

    def click_login_button(self):
        """点击登录按钮"""
        element = self.wait.until(EC.element_to_be_clickable(self.LOGIN_BUTTON))
        element.click()
