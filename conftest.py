import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import os


@pytest.fixture(scope="function")
def driver():
    chrome_options = Options()

    # Jenkins 运行 UI 自动化必备参数
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--disable-software-rasterizer")
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-background-timer-throttling")
    chrome_options.add_argument("--disable-backgrounding-occluded-windows")
    chrome_options.add_argument("--disable-breakpad")
    chrome_options.add_argument("--disable-component-update")
    chrome_options.add_argument("--disable-default-apps")
    chrome_options.add_argument("--disable-features=TranslateUI")
    chrome_options.add_argument("--disable-hang-monitor")
    chrome_options.add_argument("--disable-ipc-flooding-protection")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--disable-prompt-on-repost")
    chrome_options.add_argument("--disable-renderer-backgrounding")
    chrome_options.add_argument("--force-color-profile=srgb")
    chrome_options.add_argument("--metrics-recording-only")
    chrome_options.add_argument("--safebrowsing-disable-auto-update")
    chrome_options.add_argument("--enable-automation")
    chrome_options.add_argument("--password-store=basic")
    chrome_options.add_argument("--use-mock-keychain")

    # 禁用 Jenkins 环境中会导致崩溃的选项
    chrome_options.add_experimental_option("excludeSwitches", ["enable-logging", "enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)

    # 指定 Chrome 浏览器路径（Jenkins 服务需要绝对路径）
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if os.path.exists(chrome_path):
        chrome_options.binary_location = chrome_path
    else:
        # 尝试其他常见路径
        alt_paths = [
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            r"D:\Google\Chrome\Application\chrome.exe",
        ]
        for path in alt_paths:
            if os.path.exists(path):
                chrome_options.binary_location = path
                break

    # 启动浏览器
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(20)
    driver.set_page_load_timeout(60)

    yield driver

    driver.quit()
