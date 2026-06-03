import pytest
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service


@pytest.fixture(scope="function")
def driver():
    """初始化浏览器"""
    service = Service(executable_path=r"D:\ChromeDriver\chromedriver-win64\chromedriver.exe")
    driver = webdriver.Chrome(service=service)
    driver.maximize_window()
    driver.implicitly_wait(10)

    yield driver
    driver.quit()


@pytest.fixture(scope="session", autouse=True)
def print_test_info():
    """打印测试环境信息"""
    print("\n" + "="*50)
    print("测试环境信息")
    print("="*50)
    print(f"ChromeDriver 路径: D:\\ChromeDriver\\chromedriver-win64\\chromedriver.exe")
    print(f"测试 URL: http://127.0.0.1:8088/login")
    print("="*50 + "\n")
