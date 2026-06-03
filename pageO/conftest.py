import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="function")
def driver():
    """初始化浏览器 - 指定Chrome浏览器和驱动路径"""
    options = Options()
    # 指定Chrome浏览器可执行文件路径（Jenkins环境必需）
    options.binary_location = r"D:\Google\Chrome\Application\chrome.exe"

    service = Service(executable_path=r"D:\ChromeDriver\chromedriver-win64\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=options)
    driver.maximize_window()
    driver.implicitly_wait(10)

    yield driver
    driver.quit()
