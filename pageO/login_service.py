from pageO.login_page import LoginPage


class LoginService:
    """
    登录操作层
    封装登录业务操作，调用 LoginPage 完成具体动作
    """

    def __init__(self, driver):
        self.login_page = LoginPage(driver)

    def login(self, username: str, password: str):
        """
        执行登录操作
        :param username: 用户名
        :param password: 密码
        """
        self.login_page.input_username(username)
        self.login_page.input_password(password)
        self.login_page.click_login_button()