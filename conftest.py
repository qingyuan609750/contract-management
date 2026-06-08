import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="class")
def driver():
    chrome_options = Options()

    # Jenkins Windows 终极稳定参数
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-logging", "enable-automation"])

    # 启动浏览器
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(15)
    driver.set_page_load_timeout(30)

    # 关键：先访问项目地址
    driver.get("http://127.0.0.1:8088/login")

    yield driver

    driver.quit()
